import { Injectable } from "@nestjs/common";
import { FilterEventsDto } from "../../types/DTO/FilterEventsDto.js";
import { EventType } from "../../types/Event.js";
import { EventsRepository } from "./events.repository.js";

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  getEventById(): EventType {
    return this.eventsRepository.getMockEvent();
  }

  getAllEvents(filterDto: FilterEventsDto): EventType[] {
    const events = this.eventsRepository.getAllMockEvents();

    if (!filterDto || Object.keys(filterDto).length === 0) {
      return events;
    }

    return events.filter((event) => {
      if (filterDto.region && filterDto.region.length > 0) {
        if (!filterDto.region.includes(event.region)) {
          return false;
        }
      }

      if (filterDto.type && filterDto.type.length > 0) {
        const matchesType = filterDto.type.some(
          (type) => type === event.interceptor?.type
        );
        if (!matchesType) return false;
      }

      if (filterDto.status && filterDto.status.length > 0) {
        const matchesStatus = filterDto.status.some(
          (status) => status === event.interceptionStatus
        );
        if (!matchesStatus) return false;
      }

      if (filterDto.launchRegion && filterDto.launchRegion.length > 0) {
        if (!filterDto.launchRegion.includes(event.attackingBody)) {
          return false;
        }
      }

      return true;
    });
  }
}
