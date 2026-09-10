import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FinanceModule } from "./modules/finance/finance.module.js";
import { StatisticsModule } from "./modules/statistics/statistics.module.js";
import { EventsModule } from "./modules/events/events.module.js";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "hatzot",
      schema: "hatzot",
      autoLoadEntities: true,
      synchronize: false,
    }),
    StatisticsModule,
    FinanceModule,
    EventsModule,
    RouterModule.register([
      {
        path: "finance",
        module: FinanceModule,
      },
    ]),
  ],
})
export class AppModule {}
