import { Controller, Get } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import type { EventType } from "../../types/Event.js";
import { EventsService } from "./events.service.js";

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: "Get mock event" })
  getEventById(): EventType {
    return this.eventsService.getEventById();
  }
}
