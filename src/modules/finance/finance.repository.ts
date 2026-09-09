import { Injectable } from "@nestjs/common";
import { cardsInfo } from "./types.js";

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

  getCardsInfo(): cardsInfo {
    return this.CardsInfoMock;
  }
}
