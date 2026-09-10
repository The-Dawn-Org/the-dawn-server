import { Injectable } from "@nestjs/common";
import { FinanceRepository } from "./finance.repository.js";
import { cardsInfo, CostBySystem, DailyInterceptionsData } from "./types.js";

@Injectable()
export class FinanceService {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async getCardsInfo(startDate: string, endDate: string): Promise<cardsInfo> {
    return this.financeRepository.getCardMetrics(startDate, endDate);
  }

  async getCostBySystem(startDate: string, endDate: string): Promise<CostBySystem> {
    return this.financeRepository.getCostPerSystem(startDate, endDate);
  }

  async getDailyInterceptions(startDate: string, endDate: string): Promise<DailyInterceptionsData> {
    return this.financeRepository.getDailyInterceptions(startDate, endDate);
  }
}
