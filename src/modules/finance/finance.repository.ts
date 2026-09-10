import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  InterceptionEntity,
  InterceptionResult,
  InterceptionStatus,
} from "../finance/entities/interception.entity.js";
import type {
  BudgetByDateRange,
  cardsInfo,
  DailyInterceptionsData,
  LauncherInventoryData,
} from "./types.js";

@Injectable()
export class FinanceRepository {
  constructor(
    @InjectRepository(InterceptionEntity)
    private readonly interceptionRepo: Repository<InterceptionEntity>,
  ) {}

  /**
   * Helper to normalize dates to full UTC day bounds (00:00:00.000 to 23:59:59.999)
   */
  private normalizeDateRange(startDate?: string | Date, endDate?: string | Date) {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }

  /**
   * Aggregated metrics for summary cards.
   *
   * Drones are counted/valued purely by engagement (any interception fired
   * at them), regardless of interception outcome - dronesCount/dronesTotalCost
   * intentionally do NOT filter to successful hits.
   */
  async getCardMetrics(startDate?: string | Date, endDate?: string | Date): Promise<cardsInfo> {
    const range = this.normalizeDateRange(startDate, endDate);

    const qb = this.interceptionRepo
      .createQueryBuilder("interception")
      .select('COALESCE(SUM("interceptorType"."price"), 0)', "totalCost")
      .addSelect('COUNT("interception"."id")', "interceptorsLaunched")
      .innerJoin("interception.interceptorType", "interceptorType");

    if (range) {
      qb.where("interception.launchedAt BETWEEN :start AND :end", {
        start: range.start,
        end: range.end,
      });
    }

    // Separate aggregation: dedupe drones by id (not by price value) so
    // multiple distinct drones sharing a drone_type don't get collapsed
    // into a single SUM(DISTINCT price).
    const droneQb = this.interceptionRepo
      .createQueryBuilder("interception")
      .select('DISTINCT "drone"."id"', "droneId")
      .addSelect('"droneType"."price"', "price")
      .innerJoin("interception.drone", "drone")
      .innerJoin("drone.droneType", "droneType");

    if (range) {
      droneQb.where("interception.launchedAt BETWEEN :start AND :end", {
        start: range.start,
        end: range.end,
      });
    }

    const [raw, droneRows] = await Promise.all([qb.getRawOne(), droneQb.getRawMany()]);

    const totalCost = Number(raw?.totalCost || 0);
    const interceptorsLaunched = Number(raw?.interceptorsLaunched || 0);
    const dronesCount = droneRows.length;
    const dronesTotalCost = droneRows.reduce(
      (sum: number, row: { price: string | number }) => sum + Number(row.price || 0),
      0,
    );

    const HARDCODED_BUDGET = 180000;

    const budgetVariance =
      HARDCODED_BUDGET > 0
        ? Number((((HARDCODED_BUDGET - totalCost) / HARDCODED_BUDGET) * 100).toFixed(2))
        : 0;

    const averageInterceptCost = interceptorsLaunched > 0 ? totalCost / interceptorsLaunched : 0;

    return {
      totalCost,
      interceptorsLaunched,
      dronsesData: {
        count: dronesCount,
        totalCost: dronesTotalCost,
      },
      budgetVariance,
      averageInterceptCost,
    };
  }

  /**
   * Daily interception metrics for every day in the range, inclusive: value
   * of drones actually destroyed that day, and value of the interceptors
   * used to destroy them. Restricted to SUCCESS/HIT interceptions only -
   * pending, in-progress, failed, and aborted attempts are excluded so a
   * drone's price isn't counted for attempts that didn't actually take it
   * down (and isn't double-counted across multiple attempts against the
   * same drone).
   *
   * Days with no successful interceptions come back as
   * { dronesTotalCost: 0, interceptorsTotalCost: 0 } via a generate_series
   * left-joined against the data, so empty days aren't silently dropped
   * like a plain GROUP BY would do. The SUCCESS/HIT filter is applied
   * inside the LEFT JOIN's ON clause rather than a WHERE - putting it in
   * WHERE would strip out the NULL-joined rows for empty days along with
   * the unwanted interceptions, undoing the zero-fill.
   */
  async getDailyInterceptions(
    startDate: string | Date,
    endDate: string | Date,
  ): Promise<DailyInterceptionsData> {
    const range = this.normalizeDateRange(startDate, endDate);

    if (!range) {
      throw new Error("startDate and endDate are required");
    }

    const rawResults = await this.interceptionRepo.query(
      `
      SELECT
        day::date AS date,
        COALESCE(SUM(dt.price), 0) AS "dronesTotalCost",
        COALESCE(SUM(it.price), 0) AS "interceptorsTotalCost"
      FROM generate_series($1::date, $2::date, interval '1 day') AS day
      LEFT JOIN hatzot.interception i
        ON (i.launched_at AT TIME ZONE 'UTC')::date = day::date
        AND i.status = $3
        AND i.result = $4
      LEFT JOIN hatzot.interceptor_type it
        ON it.id = i.interceptor_type_id
      LEFT JOIN hatzot.drone d
        ON d.id = i.drone_id
      LEFT JOIN hatzot.drone_type dt
        ON dt.id = d.drone_type_id
      GROUP BY day
      ORDER BY day ASC
      `,
      [range.start, range.end, InterceptionStatus.SUCCESS, InterceptionResult.HIT],
    );

    return rawResults.map(
      (row: { date: string; dronesTotalCost: string; interceptorsTotalCost: string }) => ({
        date: row.date,
        dronesTotalCost: Number(row.dronesTotalCost || 0),
        interceptorsTotalCost: Number(row.interceptorsTotalCost || 0),
      }),
    );
  }

  /**
   * Cost breakdown per system with a hardcoded budget of 180,000
   */
  async getCostPerSystem(startDate?: string | Date, endDate?: string | Date) {
    const range = this.normalizeDateRange(startDate, endDate);

    const qb = this.interceptionRepo
      .createQueryBuilder("interception")
      .select('"interceptorType"."name"', "systemName")
      .addSelect('COALESCE(SUM("interceptorType"."price"), 0)', "totalCost")
      .innerJoin("interception.interceptorType", "interceptorType")
      .groupBy('"interceptorType"."name"');

    if (range) {
      qb.where("interception.launchedAt BETWEEN :start AND :end", {
        start: range.start,
        end: range.end,
      });
    }

    const rawResults = await qb.getRawMany();

    return rawResults.map((row) => ({
      systemName: row.systemName,
      totalCost: Number(row.totalCost || 0),
    }));
  }

  /**
   * Daily budget spent (cost of every interceptor fired, hit or miss) for
   * every day in the range, inclusive. Days with no interceptions come
   * back as budget: 0, via a generate_series left-joined against the data
   * so empty days aren't silently dropped like a plain GROUP BY would do.
   */
  async getBudgetByDateRange(
    startDate: string | Date,
    endDate: string | Date,
  ): Promise<BudgetByDateRange> {
    const range = this.normalizeDateRange(startDate, endDate);

    if (!range) {
      throw new Error("startDate and endDate are required");
    }

    const rawResults = await this.interceptionRepo.query(
      `
      SELECT
        day::date AS date,
        COALESCE(SUM(it.price), 0) AS budget
      FROM generate_series($1::date, $2::date, interval '1 day') AS day
      LEFT JOIN hatzot.interception i
        ON (i.launched_at AT TIME ZONE 'UTC')::date = day::date
      LEFT JOIN hatzot.interceptor_type it
        ON it.id = i.interceptor_type_id
      GROUP BY day
      ORDER BY day ASC
      `,
      [range.start, range.end],
    );

    return rawResults.map((row: { date: string; budget: string }) => ({
      date: row.date,
      budget: Number(row.budget || 0),
    }));
  }

  /**
   * Current interceptor stock per launcher system (launcher_type), plus a
   * hardcoded min/max capacity band per type for the inventory gauge chart.
   *
   * "Current" is the live stockpile: SUM(launcher_ammunition.quantity)
   * across every live_launcher of that launcher_type. min/max aren't
   * tracked anywhere in the schema, so they're hardcoded here per type
   * name - update LAUNCHER_INVENTORY_THRESHOLDS if launcher_type names
   * change or a new type is added, or a type will silently fall back to
   * the DEFAULT_THRESHOLDS band.
   */
  async getLauncherInventory(): Promise<LauncherInventoryData> {
    const rawResults = await this.interceptionRepo.query(`
      SELECT
        lt.id AS "launcherTypeId",
        lt.name AS "launcherTypeName",
        COALESCE(SUM(la.quantity), 0) AS "currentQuantity"
      FROM hatzot.launcher_type lt
      LEFT JOIN hatzot.live_launcher ll
        ON ll.launcher_type_id = lt.id
      LEFT JOIN hatzot.launcher_ammunition la
        ON la.launcher_id = ll.id
      GROUP BY lt.id, lt.name
      ORDER BY lt.id ASC
    `);

    return rawResults.map(
      (row: { launcherTypeId: number; launcherTypeName: string; currentQuantity: string }) => {
        const thresholds =
          LAUNCHER_INVENTORY_THRESHOLDS[row.launcherTypeName] ?? DEFAULT_INVENTORY_THRESHOLDS;

        return {
          type: row.launcherTypeName,
          current: Number(row.currentQuantity || 0),
          min: thresholds.min,
          max: thresholds.max,
        };
      },
    );
  }
}

/**
 * Hardcoded min/max capacity band per launcher_type.name, since the DB has
 * no columns for this. Keyed by name rather than id so seed-data reordering
 * doesn't silently mismatch a type to the wrong band.
 */
const LAUNCHER_INVENTORY_THRESHOLDS: Record<string, { min: number; max: number }> = {
  "ShieldNest-Lite": { min: 1000, max: 5000 },
  "IronHook-SR": { min: 60, max: 300 },
  "HorizonEye-MX": { min: 30, max: 150 },
  "CloudFence-Area": { min: 16, max: 80 },
};

/** Fallback band for any launcher_type not listed above. */
const DEFAULT_INVENTORY_THRESHOLDS = { min: 0, max: 100 };
