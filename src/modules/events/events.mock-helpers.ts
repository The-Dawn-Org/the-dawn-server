import { FilterEventsDto } from "../../types/DTO/FilterEventsDto.js";
import { EventType } from "../../types/Event.js";
import {
  InterceptionEntity,
  InterceptionResult,
  InterceptionStatus,
} from "../entities/interception.entity.js";

const REGION_CENTERS = [
  { name: "מחוז תל אביב", latitude: 32.0853, longitude: 34.7818 },
  { name: "צפון", latitude: 32.965, longitude: 35.5 },
  { name: "דרום", latitude: 30.8, longitude: 34.8 },
  { name: "ירושלים", latitude: 31.7683, longitude: 35.2137 },
] as const;

const STATUS_IN_HEBREW: Record<InterceptionStatus, string> = {
  [InterceptionStatus.PENDING]: "ממתין",
  [InterceptionStatus.IN_PROGRESS]: "בתהליך",
  [InterceptionStatus.SUCCESS]: "הושלם בהצלחה",
  [InterceptionStatus.FAILED]: "נכשל",
  [InterceptionStatus.ABORTED]: "בוטל",
};

const RESULT_IN_HEBREW: Record<InterceptionResult, string> = {
  [InterceptionResult.HIT]: "יורט",
  [InterceptionResult.MISS]: "לא יורט",
};

function getRegion(latitude: number, longitude: number): string {
  return REGION_CENTERS.reduce((nearest, candidate) => {
    const nearestDistance =
      (latitude - nearest.latitude) ** 2 +
      (longitude - nearest.longitude) ** 2;
    const candidateDistance =
      (latitude - candidate.latitude) ** 2 +
      (longitude - candidate.longitude) ** 2;

    return candidateDistance < nearestDistance ? candidate : nearest;
  }).name;
}

function getDroneInjuryCount(id: string, result: InterceptionResult | null): number {
  if (result !== InterceptionResult.MISS) return 0;

  let hash = 0;
  for (const character of id) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return (hash % 5) + 1;
}

export function enrichMockEvent(event: EventType): EventType {
  const latitude = event.eventLocation.lat ?? event.launcher.location.lat;
  const longitude = event.eventLocation.lng ?? event.launcher.location.lng;
  const result =
    event.interceptionStatus === RESULT_IN_HEBREW[InterceptionResult.HIT]
      ? InterceptionResult.HIT
      : InterceptionResult.MISS;
  const region = getRegion(latitude, longitude);

  return {
    ...event,
    region,
    eventLocation: { lat: latitude, lng: longitude },
    interceptionStatus: RESULT_IN_HEBREW[result],
    droneInjuryCount: getDroneInjuryCount(event.eventId.toString(), result),
    attackingBody: region === "צפון" ? "חיזבאללה" : "חמאס",
  };
}

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
  const latitude =
    entity.interceptorLatitude ?? entity.liveLauncher?.latitude ?? 0;
  const longitude =
    entity.interceptorLongitude ?? entity.liveLauncher?.longitude ?? 0;
  const region = getRegion(latitude, longitude);

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
    region,
    time: entity.launchedAt ? entity.launchedAt.toISOString() : "",
    eventLocation: {
      lat: latitude,
      lng: longitude,
    },
    interceptionStatus: RESULT_IN_HEBREW[entity.result as InterceptionResult],
    droneInjuryCount: getDroneInjuryCount(entity.id, entity.result),
    attackingBody: region === "צפון" ? "חיזבאללה" : "חמאס",
    drone: {
      type: entity.drone?.droneType?.name ?? "",
      price: entity.drone?.droneType?.price ?? 0,
    },
  };
}