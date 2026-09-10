import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { DateRangeQueryDto } from "../../DTOS/date-range-query.dto.js";
import { FinanceService } from "./finance.service.js";
import type {
  BudgetByDateRange,
  cardsInfo,
  CostBySystem,
  DailyInterceptionsData,
  LauncherInventoryData,
} from "./types.ts";

@Controller()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get("cards")
  @ApiOperation({ summary: "get cards data" })
  async getCardsInfo(@Query() query: DateRangeQueryDto): Promise<cardsInfo> {
    return this.financeService.getCardsInfo(query.startDate, query.endDate);
  }

  @Get("cost-by-system")
  @ApiOperation({ summary: "get cost per system chart data" })
  async getCostBySystem(@Query() query: DateRangeQueryDto): Promise<CostBySystem> {
    return this.financeService.getCostBySystem(query.startDate, query.endDate);
  }

  @Get("daily-interceptions")
  @ApiOperation({ summary: "get daily drone interception stats" })
  async getDailyInterceptions(@Query() query: DateRangeQueryDto): Promise<DailyInterceptionsData> {
    return this.financeService.getDailyInterceptions(query.startDate, query.endDate);
  }

  @Get("budget-by-date")
  @ApiOperation({ summary: "get budget spent per day in a date range" })
  async getBudgetByDateRange(@Query() query: DateRangeQueryDto): Promise<BudgetByDateRange> {
    return this.financeService.getBudgetByDateRange(query.startDate, query.endDate);
  }

  @Get("launcher-inventory")
  @ApiOperation({
    summary: "get current interceptor stock per launcher system, with min/max capacity",
  })
  async getLauncherInventory(): Promise<LauncherInventoryData> {
    return this.financeService.getLauncherInventory();
  }
}
