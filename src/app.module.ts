import { Module } from "@nestjs/common";
import { StatisticsModule } from "./modules/statistics/statistics.module.js";

@Module({
  imports: [StatisticsModule],
})
export class AppModule {}
