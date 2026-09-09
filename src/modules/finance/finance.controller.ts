import { Controller, Get } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { FinanceService } from "./finance.service.js";
import type { cardsInfo } from "./types.js";


@Controller()
export class FinanceController {
    constructor(private readonly financeService: FinanceService) {}

    @Get("cards")
    @ApiOperation({summary: "get cards data"})
    getCardsInfo(): cardsInfo {
        return this.financeService.getCardsInfo()
    }
}