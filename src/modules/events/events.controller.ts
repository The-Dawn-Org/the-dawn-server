import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import type { EventType } from "../../types/Event.js";
import { FilterEventsDto } from "../../types/DTO/FilterEventsDto.js";
import { EventsService } from "./events.service.js";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: "Get mock event" })
  getEventById(): EventType {
    return this.eventsService.getEventById();
  }

  @Post("all-events")
  @ApiOperation({ summary: "Get a list of all events with optional filters" })
  getAllEvents(@Body() filterDto: FilterEventsDto): EventType[] {
    return this.eventsService.getAllEvents(filterDto);
  }
}
