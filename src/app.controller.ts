import { Controller, Get } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { AppService } from "./app.service.js";
import { MockData } from "./app.repository.js";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: "Get mock data" })
  getHello(): MockData[] {
    return this.appService.getHello();
  }
}
