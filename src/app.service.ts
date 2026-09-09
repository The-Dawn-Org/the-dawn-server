import { Injectable } from "@nestjs/common";
import { AppRepository, MockData } from "./app.repository.js";

@Injectable()
export class AppService {
  constructor(private readonly appRepository: AppRepository) {}

  getHello(): MockData[] {
    return this.appRepository.getMockData();
  }
}
