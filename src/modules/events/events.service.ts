import { Injectable } from "@nestjs/common";
import { EventsRepository, MockData } from "./events.repository.js";

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  getHello(): MockData[] {
    return this.eventsRepository.getMockData();
  }
}
