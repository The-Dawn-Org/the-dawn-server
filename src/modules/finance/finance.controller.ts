import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { DateRangeQueryDto } from "../../DTOS/date-range-query.dto.js";
import { FinanceService } from "./finance.service.js";
import type {
  CostBySystem,
  DailyInterceptionsData,
  cardsInfo,
} from "./types.js";

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
  async getCostBySystem(
    @Query() query: DateRangeQueryDto,
  ): Promise<CostBySystem> {
    return this.financeService.getCostBySystem(query.startDate, query.endDate);
  }

  @Get("daily-interceptions")
  @ApiOperation({ summary: "get daily drone interception stats" })
  async getDailyInterceptions(
    @Query() query: DateRangeQueryDto,
  ): Promise<DailyInterceptionsData> {
    return this.financeService.getDailyInterceptions(
      query.startDate,
      query.endDate,
    );
  }

  @Get("budget-by-date")
  async getBudgetByDateRange(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.financeService.getBudgetByDateRange(startDate, endDate);
  }
}
