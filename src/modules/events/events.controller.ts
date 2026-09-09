import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import type { EventType } from "../../types/Event.js";
import { EventsService } from "./events.service.js";

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get(':id')
  @ApiOperation({ summary: "Get mock event" })
  getEventById(@Param('id') id: string): EventType {
    return this.eventsService.getEventById(id);
  }
}
