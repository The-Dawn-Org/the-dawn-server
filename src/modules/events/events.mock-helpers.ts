import { FilterEventsDto } from "../../types/DTO/FilterEventsDto.js";
import { EventType } from "../../types/Event.js";
import { InterceptionEntity } from "../entities/interception.entity.js";

export function filterMockEvents(mockEvents: EventType[], filterDto?: FilterEventsDto): EventType[] {
  if (!filterDto || Object.keys(filterDto).length === 0) {
    return mockEvents;
  }

  return mockEvents.filter((event) => {
    if (filterDto.region?.length && !filterDto.region.includes(event.region)) {
      return false;
    }
    if (filterDto.type?.length && !filterDto.type.includes(event.interceptor?.type)) {
      return false;
    }
    if (filterDto.status?.length && !filterDto.status.includes(event.interceptionStatus)) {
      return false;
    }
    if (filterDto.launchRegion?.length && !filterDto.launchRegion.includes(event.attackingBody)) {
      return false;
    }
    return true;
  });
}

export function findMockEventById(mockEvents: EventType[], id: number): EventType {
  return mockEvents.find((e) => e.eventId === id) ?? mockEvents[0];
}

export function mapEntityToEventType(entity: InterceptionEntity): EventType {
  return {
    eventId: Number(entity.id),
    interceptor: {
      interceptorTypeId: entity.interceptorType?.id ?? 0,
      type: entity.interceptorType?.name ?? "",
      price: entity.interceptorType?.price ?? 0,
    },
    launcher: {
      launcherId: Number(entity.liveLauncher?.id ?? 0),
      location: {
        lat: entity.liveLauncher?.latitude ?? 0,
        lng: entity.liveLauncher?.longitude ?? 0,
      },
    },
    region: "",
    time: entity.launchedAt ? entity.launchedAt.toISOString() : "",
    eventLocation: {
      lat: entity.interceptorLatitude ?? 0,
      lng: entity.interceptorLongitude ?? 0,
    },
    interceptionStatus: entity.status,
    droneInjuryCount: 0,
    eventStatus: "",
    attackingBody: "",
    drone: {
      type: entity.drone?.droneType?.name ?? "",
      price: entity.drone?.droneType?.price ?? 0,
    },
  };
}