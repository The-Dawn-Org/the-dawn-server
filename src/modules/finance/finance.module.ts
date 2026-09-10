import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as Entities from "./entities/index.js";
import { FinanceController } from "./finance.controller.js";
import { FinanceRepository } from "./finance.repository.js";
import { FinanceService } from "./finance.service.js";

@Module({
  imports: [
    TypeOrmModule.forFeature(Object.values(Entities).filter((item) => typeof item === "function")),
  ],
  controllers: [FinanceController],
  providers: [FinanceRepository, FinanceService],
})
export class FinanceModule {}
