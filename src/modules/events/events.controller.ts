import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { ApiOperation, ApiParam } from "@nestjs/swagger";
import { FilterEventsDto } from "../../types/DTO/FilterEventsDto.js";
import type { EventType } from "../../types/Event.js";
import { EventsService } from "./events.service.js";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get(":id")
  @ApiOperation({ summary: "Get event by ID" })
  @ApiParam({ name: "id", type: Number, description: "Event ID" })
  async getEventById(@Param("id", ParseIntPipe) id: number): Promise<EventType> {
    return await this.eventsService.getEventById(id);
  }

  @Post("all-events")
  @ApiOperation({ summary: "Get a list of all events with optional filters" })
  async getAllEvents(@Body() filterDto: FilterEventsDto): Promise<EventType[]> {
    return await this.eventsService.getAllEvents(filterDto);
  }
}