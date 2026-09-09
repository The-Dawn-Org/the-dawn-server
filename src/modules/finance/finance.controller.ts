import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { FinanceService } from "./finance.service.js";
import type { cardsInfo, CostBySystem, DailyInterceptionsData } from "./types.js";

@Controller()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get("cards")
  @ApiOperation({ summary: "get cards data" })
  @ApiQuery({ name: "startDate", required: true, type: String })
  @ApiQuery({ name: "endDate", required: true, type: String })
  getCardsInfo(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ): cardsInfo {
    return this.financeService.getCardsInfo(startDate, endDate);
  }

  @Get("cost-by-system")
  @ApiOperation({ summary: "get cost per system chart data" })
  @ApiQuery({ name: "startDate", required: true, type: String })
  @ApiQuery({ name: "endDate", required: true, type: String })
  getCostBySystem(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ): CostBySystem {
    return this.financeService.getCostBySystem(startDate, endDate);
  }

  @Get("daily-interceptions")
  @ApiOperation({ summary: "get daily drone interception stats" })
  @ApiQuery({ name: "startDate", required: true, type: String })
  @ApiQuery({ name: "endDate", required: true, type: String })
  getDailyInterceptions(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ): DailyInterceptionsData {
    return this.financeService.getDailyInterceptions(startDate, endDate);
  }
}
