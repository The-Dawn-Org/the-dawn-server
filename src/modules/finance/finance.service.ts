import { Injectable } from "@nestjs/common";
import { FinanceRepository } from "./finance.repository.js";
import { cardsInfo, CostBySystem } from "./types.js";

@Injectable()
export class FinanceService {
    constructor(private readonly financeRepository: FinanceRepository) {}

    getCardsInfo(startDate: string, endDate: string): cardsInfo {
        return this.financeRepository.getCardsInfo(startDate, endDate);
    }

    getCostBySystem(startDate: string, endDate: string): CostBySystem {
        return this.financeRepository.getCostBySystem(startDate, endDate);
    }
}