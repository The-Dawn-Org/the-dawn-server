import { Controller, Get } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { MockData } from "./statistics.repository.js";
import { StatisticsService } from "./statistics.service.js";

@Controller()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: "Get mock data" })
  getHello(): MockData[] {
    return this.statisticsService.getHello();
  }
}
