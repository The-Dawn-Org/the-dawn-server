import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { FinanceModule } from "./modules/finance/finance.module.js";
import { StatisticsModule } from "./modules/statistics/statistics.module.js";

@Module({
  imports: [
    StatisticsModule,
    FinanceModule,
    RouterModule.register([
      {
        path: "finance",
        module: FinanceModule,
      },
    ]),
  ],
})
export class AppModule {}
