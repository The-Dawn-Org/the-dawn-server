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

      const parseAsUTC = (dateStr: string | Date) => {
        const str =
          typeof dateStr === "string" && !dateStr.endsWith("Z")
            ? dateStr + "Z"
            : dateStr;
        return new Date(str).getTime();
      };

      const eventDate = parseAsUTC(event.time);
      const start = filterDto.startDate ? parseAsUTC(filterDto.startDate) : 0;
      const end = filterDto.endDate ? parseAsUTC(filterDto.endDate) : Infinity;

      if (eventDate < start || eventDate > end) return false;
      return true;
    });
  }
}
