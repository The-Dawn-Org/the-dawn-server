import type { MockInterceptionRecord } from "./finance.mock-data.js";
import type {
  cardsInfo,
  CostBySystem,
  DailyInterceptionsData,
} from "./types.js";

const HARDCODED_BUDGET = 180000;

function inRange(
  iso: string,
  range: { start: string; end: string } | null
): boolean {
  if (!range) return true;
  return iso >= range.start && iso <= range.end;
}

export function computeCardMetrics(
  records: MockInterceptionRecord[],
  range: { start: string; end: string } | null
): cardsInfo {
  const filtered = records.filter((r) => inRange(r.launchedAt, range));

  const totalCost = filtered.reduce((sum, r) => sum + r.interceptorPrice, 0);
  const interceptorsLaunched = filtered.length;

  const uniqueDroneIds = new Set(filtered.map((r) => r.droneId));
  const dronesCount = uniqueDroneIds.size;

  const dronesTotalCost = [
    ...new Set(filtered.map((r) => r.dronePrice)),
  ].reduce((sum, p) => sum + p, 0);

  const budgetVariance =
    HARDCODED_BUDGET > 0
      ? Number(
          (((HARDCODED_BUDGET - totalCost) / HARDCODED_BUDGET) * 100).toFixed(2)
        )
      : 0;

  const averageInterceptCost =
    interceptorsLaunched > 0 ? totalCost / interceptorsLaunched : 0;

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

export function computeDailyInterceptions(
  records: MockInterceptionRecord[],
  range: { start: string; end: string } | null
): DailyInterceptionsData {
  const filtered = records.filter((r) => inRange(r.launchedAt, range));

  const byDate = new Map<
    string,
    { dronesTotalCost: number; interceptorsTotalCost: number }
  >();

  for (const r of filtered) {
    const date = r.launchedAt.slice(0, 10);
    const entry = byDate.get(date) ?? {
      dronesTotalCost: 0,
      interceptorsTotalCost: 0,
    };
    entry.dronesTotalCost += r.dronePrice;
    entry.interceptorsTotalCost += r.interceptorPrice;
    byDate.set(date, entry);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, totals]) => ({ date, ...totals }));
}

export function computeCostPerSystem(
  records: MockInterceptionRecord[],
  range: { start: string; end: string } | null
): CostBySystem {
  const filtered = records.filter((r) => inRange(r.launchedAt, range));

  const bySystem = new Map<string, number>();
  for (const r of filtered) {
    bySystem.set(
      r.interceptorTypeName,
      (bySystem.get(r.interceptorTypeName) ?? 0) + r.interceptorPrice
    );
  }

  return [...bySystem.entries()].map(([systemName, totalCost]) => ({
    systemName: systemName as CostBySystem[number]["systemName"],
    totalCost,
  }));
}
