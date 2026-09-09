import { Module } from "@nestjs/common";
import { FinanceController } from "./finance.controller.js";
import { FinanceRepository } from "./finance.repository.js";
import { FinanceService } from "./finance.service.js";

@Module({
    imports: [],
    controllers: [FinanceController],
    providers: [FinanceRepository, FinanceService]
})
export class FinanceModule {}
