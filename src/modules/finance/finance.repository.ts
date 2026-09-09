import { Injectable } from "@nestjs/common";
import { cardsInfo, CostBySystem } from "./types.js";

@Injectable()
export class FinanceRepository {
  private readonly CardsInfoMock: cardsInfo = {
    totalCost: 291000000,
    interceptorsLaunced: 264,
    dronsesData: {
        totalCost: 3200000,
        count: 161
    },
    budgetVariance: 41.8,
    averageInterceptCost: 1100000
  };

  private readonly CostBySystemMock: CostBySystem = [
    { system: "Arrow 3", cost: 145000000 },
    { system: "Arrow 2", cost: 76000000 },
    { system: "David's Sling", cost: 58000000 },
    { system: "Iron Dome", cost: 3000000 },
  ];

  getCardsInfo(_startDate: string, _endDate: string): cardsInfo {
    // Implement date filtering logic here when connecting DB
    return this.CardsInfoMock;
  }

  getCostBySystem(_startDate: string, _endDate: string): CostBySystem {
    // Implement date filtering logic here when connecting DB
    return this.CostBySystemMock;
  }
}