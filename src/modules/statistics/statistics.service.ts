import { Injectable } from "@nestjs/common";
import { MockData, StatisticsRepository } from "./statistics.repository.js";

@Injectable()
export class StatisticsService {
  constructor(private readonly statisticsRepository: StatisticsRepository) {}

  getHello(): MockData[] {
    return this.statisticsRepository.getMockData();
  }
}
