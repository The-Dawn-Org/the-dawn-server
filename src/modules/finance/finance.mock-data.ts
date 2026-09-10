import eventsData from "../database/mocks/events.json" with { type: "json" };

export interface MockInterceptionRecord {
  launchedAt: string;
  interceptorTypeName: string;
  interceptorPrice: number;
  droneId: number;
  dronePrice: number;
}

interface RawEvent {
  eventId: number;
  interceptor: { type: string; price: number };
  time: string;
  drone: { type: string; price: number };
}

export const mockInterceptionRecords: MockInterceptionRecord[] = (eventsData as RawEvent[]).map((event) => ({
  launchedAt: event.time,
  interceptorTypeName: event.interceptor.type,
  interceptorPrice: event.interceptor.price,
  droneId: event.eventId, 
  dronePrice: event.drone.price,
}));