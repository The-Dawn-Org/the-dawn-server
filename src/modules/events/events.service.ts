import { Injectable } from "@nestjs/common";
import { FilterEventsDto } from "../../types/DTO/FilterEventsDto.js";
import { EventType } from "../../types/Event.js";
import { EventsRepository } from "./events.repository.js";

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async getEventById(id: number): Promise<EventType> {
    return await this.eventsRepository.getEventById(id);
  }

  async getAllEvents(filterDto: FilterEventsDto): Promise<EventType[]> {
    return this.eventsRepository.getAllEvents(filterDto);
  }
}
