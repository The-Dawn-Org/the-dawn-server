import { Injectable } from "@nestjs/common";
import { EventType } from "../../types/Event.js";
import { EventsRepository } from "./events.repository.js";

@Injectable()
export class EventsService {
  constructor(private readonly EventsRepository: EventsRepository) {}

  getEventById(id: string): EventType {
    return this.EventsRepository.getMockEvent(id);
  }
}
