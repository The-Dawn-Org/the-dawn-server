import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { DatabaseModule } from "./modules/database/database.module.js";
import { EventsModule } from "./modules/events/events.module.js";
import { FinanceModule } from "./modules/finance/finance.module.js";
import { StatisticsModule } from "./modules/statistics/statistics.module.js";

@Module({
  imports: [
    DatabaseModule,
    StatisticsModule,
    EventsModule,
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