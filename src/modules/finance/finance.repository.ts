import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { DB_CONNECTION } from "../database/database.module.js";
import { withFallback } from "../database/with-fallback.js";
import { InterceptionEntity } from "../entities/interception.entity.js";
import {
  computeCardMetrics,
  computeCostPerSystem,
  computeDailyInterceptions,
} from "./finance.mock-aggregations.js";
import { mockInterceptionRecords } from "./finance.mock-data.js";
import type {
  CostBySystem,
  DailyInterceptionsData,
  cardsInfo,
} from "./types.js";

@Injectable()
export class FinanceRepository {
  constructor(@Inject(DB_CONNECTION) private readonly dataSource: DataSource) {}

  private get interceptionRepo(): Repository<InterceptionEntity> {
    return this.dataSource.getRepository(InterceptionEntity);
  }

  private normalizeDateRange(
    startDate?: string | Date,
    endDate?: string | Date
  ): { start: string; end: string } | null {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    return { start: start.toISOString(), end: end.toISOString() };
  }

  async getCardMetrics(
    startDate?: string | Date,
    endDate?: string | Date
  ): Promise<cardsInfo> {
    const range = this.normalizeDateRange(startDate, endDate);
    return withFallback(
      () => this.queryCardMetrics(range),
      () => computeCardMetrics(mockInterceptionRecords, range)
    );
  }

  async getDailyInterceptions(
    startDate?: string | Date,
    endDate?: string | Date
  ): Promise<DailyInterceptionsData> {
    const range = this.normalizeDateRange(startDate, endDate);
    return withFallback(
      () => this.queryDailyInterceptions(range),
      () => computeDailyInterceptions(mockInterceptionRecords, range)
    );
  }

  async getCostPerSystem(
    startDate?: string | Date,
    endDate?: string | Date
  ): Promise<CostBySystem> {
    const range = this.normalizeDateRange(startDate, endDate);
    return withFallback(
      () => this.queryCostPerSystem(range),
      () => computeCostPerSystem(mockInterceptionRecords, range)
    );
  }

  private async queryCardMetrics(
    range: { start: string; end: string } | null
  ): Promise<cardsInfo> {
    const qb = this.interceptionRepo
      .createQueryBuilder("interception")
      .select('COALESCE(SUM("interceptorType"."price"), 0)', "totalCost")
      .addSelect('COUNT("interception"."id")', "interceptorsLaunched")
      .addSelect('COUNT(DISTINCT "drone"."id")', "dronesCount")
      .addSelect(
        'COALESCE(SUM(DISTINCT "droneType"."price"), 0)',
        "dronesTotalCost"
      )
      .innerJoin("interception.interceptorType", "interceptorType")
      .innerJoin("interception.drone", "drone")
      .innerJoin("drone.droneType", "droneType");

    if (range) {
      qb.where("interception.launchedAt BETWEEN :start AND :end", range);
    }

    const raw = await qb.getRawOne();

    const totalCost = Number(raw?.totalCost || 0);
    const interceptorsLaunched = Number(raw?.interceptorsLaunched || 0);
    const dronesCount = Number(raw?.dronesCount || 0);
    const dronesTotalCost = Number(raw?.dronesTotalCost || 0);

    const HARDCODED_BUDGET = 180000;
    const budgetVariance =
      HARDCODED_BUDGET > 0
        ? Number(
            (((HARDCODED_BUDGET - totalCost) / HARDCODED_BUDGET) * 100).toFixed(
              2
            )
          )
        : 0;
    const averageInterceptCost =
      interceptorsLaunched > 0 ? totalCost / interceptorsLaunched : 0;

    return {
      totalCost,
      interceptorsLaunched,
      dronsesData: { count: dronesCount, totalCost: dronesTotalCost },
      budgetVariance,
      averageInterceptCost,
    };
  }

  private async queryDailyInterceptions(
    range: { start: string; end: string } | null
  ): Promise<DailyInterceptionsData> {
    const qb = this.interceptionRepo
      .createQueryBuilder("interception")
      .select("DATE(interception.launchedAt)", "date")
      .addSelect('COALESCE(SUM("droneType"."price"), 0)', "dronesTotalCost")
      .addSelect(
        'COALESCE(SUM("interceptorType"."price"), 0)',
        "interceptorsTotalCost"
      )
      .innerJoin("interception.interceptorType", "interceptorType")
      .innerJoin("interception.drone", "drone")
      .innerJoin("drone.droneType", "droneType")
      .groupBy("DATE(interception.launchedAt)")
      .orderBy("DATE(interception.launchedAt)", "ASC");

    if (range) {
      qb.where("interception.launchedAt BETWEEN :start AND :end", range);
    }

    const rawResults = await qb.getRawMany();
    return rawResults.map((row) => ({
      date: row.date,
      dronesTotalCost: Number(row.dronesTotalCost || 0),
      interceptorsTotalCost: Number(row.interceptorsTotalCost || 0),
    }));
  }

  private async queryCostPerSystem(
    range: { start: string; end: string } | null
  ): Promise<CostBySystem> {
    const qb = this.interceptionRepo
      .createQueryBuilder("interception")
      .select('"interceptorType"."name"', "systemName")
      .addSelect('COALESCE(SUM("interceptorType"."price"), 0)', "totalCost")
      .innerJoin("interception.interceptorType", "interceptorType")
      .groupBy('"interceptorType"."name"');

    if (range) {
      qb.where("interception.launchedAt BETWEEN :start AND :end", range);
    }

    const rawResults = await qb.getRawMany();
    return rawResults.map((row) => ({
      systemName: row.systemName,
      totalCost: Number(row.totalCost || 0),
    }));
  }
}
