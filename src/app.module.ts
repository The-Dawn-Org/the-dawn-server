import { Module } from "@nestjs/common";
import { EventsModule } from "./modules/events/events.module.js";
import { StatisticsModule } from "./modules/statistics/statistics.module.js";

@Module({
  imports: [StatisticsModule, EventsModule],
})
export class AppModule {}
