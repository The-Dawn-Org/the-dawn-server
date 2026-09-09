import { Module } from "@nestjs/common";
import { StatisticsController } from "./statistics.controller.js";
import { StatisticsRepository } from "./statistics.repository.js";
import { StatisticsService } from "./statistics.service.js";

@Module({
  imports: [],
  controllers: [StatisticsController],
  providers: [StatisticsService, StatisticsRepository],
})
export class StatisticsModule {}
