import { Module } from "@nestjs/common";
import { FinanceModule } from "./modules/finance/finance.module.js";
import { StatisticsModule } from "./modules/statistics/statistics.module.js";

@Module({
  imports: [StatisticsModule, FinanceModule],
})
export class AppModule {}
