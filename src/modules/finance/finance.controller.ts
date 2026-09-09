import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { DateRangeQueryDto } from "../../DTOS/date-range-query.dto.js";
import { FinanceService } from "./finance.service.js";
import type { cardsInfo, CostBySystem, DailyInterceptionsData } from "./types.ts";

@Controller()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get("cards")
  @ApiOperation({ summary: "get cards data" })
  getCardsInfo(@Query() query: DateRangeQueryDto): cardsInfo {
    return this.financeService.getCardsInfo(query.startDate, query.endDate);
  }

  @Get("cost-by-system")
  @ApiOperation({ summary: "get cost per system chart data" })
  getCostBySystem(@Query() query: DateRangeQueryDto): CostBySystem {
    return this.financeService.getCostBySystem(query.startDate, query.endDate);
  }

  @Get("daily-interceptions")
  @ApiOperation({ summary: "get daily drone interception stats" })
  getDailyInterceptions(@Query() query: DateRangeQueryDto): DailyInterceptionsData {
    return this.financeService.getDailyInterceptions(query.startDate, query.endDate);
  }
}
