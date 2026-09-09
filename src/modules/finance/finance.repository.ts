import { Injectable } from "@nestjs/common";
import { cardsInfo, CostBySystem, DailyInterceptionsData } from "./types.js";

@Injectable()
export class FinanceRepository {
  private readonly CardsInfoMock: cardsInfo = {
    totalCost: 291000000,
    interceptorsLaunced: 264,
    dronsesData: {
      totalCost: 3200000,
      count: 161,
    },
    budgetVariance: 41.8,
    averageInterceptCost: 1100000,
  };

  private readonly CostBySystemMock: CostBySystem = [
    { system: "Arrow 3", cost: 145000000 },
    { system: "Arrow 2", cost: 76000000 },
    { system: "David's Sling", cost: 58000000 },
    { system: "Iron Dome", cost: 3000000 },
  ];

  private readonly DailyInterceptionsMock: DailyInterceptionsData = [
    { date: "2026-03-01", dronesIntercepted: 12, totalCost: 240000 },
    { date: "2026-03-02", dronesIntercepted: 25, totalCost: 500000 },
    { date: "2026-03-03", dronesIntercepted: 18, totalCost: 360000 },
    { date: "2026-03-04", dronesIntercepted: 30, totalCost: 600000 },
    { date: "2026-03-05", dronesIntercepted: 8, totalCost: 160000 },
    { date: "2026-03-06", dronesIntercepted: 42, totalCost: 840000 },
    { date: "2026-03-07", dronesIntercepted: 26, totalCost: 520000 },
  ];

  getCardsInfo(_startDate: string, _endDate: string): cardsInfo {
    // Implement date filtering logic here when connecting DB
    return this.CardsInfoMock;
  }

  getCostBySystem(_startDate: string, _endDate: string): CostBySystem {
    // Implement date filtering logic here when connecting DB
    return this.CostBySystemMock;
  }

  getDailyInterceptions(_startDate: string, _endDate: string): DailyInterceptionsData {
    // Implement date filtering logic here when connecting DB
    return this.DailyInterceptionsMock;
  }
}
