import { Injectable } from "@nestjs/common";
import { FinanceRepository } from "./finance.repository.js";
import { cardsInfo } from "./types.js";

@Injectable()
export class FinanceService {
    constructor(private readonly financeRepository: FinanceRepository) {}

    getCardsInfo(): cardsInfo {
        return this.financeRepository.getCardsInfo()
    }

}