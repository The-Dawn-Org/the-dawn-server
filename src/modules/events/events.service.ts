import { Injectable } from "@nestjs/common";
import { EventType, EventsRepository } from "./events.repository.js";

@Injectable()
export class EventsService {
  constructor(private readonly EventsRepository: EventsRepository) {}

  getEventById(): EventType {
    return this.EventsRepository.getMockEvent();
  }
}
