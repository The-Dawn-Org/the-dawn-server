import { Injectable } from "@nestjs/common";

export interface EventType {
    eventId: number;
  
    interceptor: {
      interceptorTypeId: number;
      type: string;
      price: number;
    };
  
    launcher: {
      launcherId: number;
      location: {
        lat: number;
        lng: number;
      };
    };
  
    region: string;
  
    time: string;
  
    eventLocation: {
      lat: number;
      lng: number;
    };
  
    interceptionStatus: string;
  
    droneInjuryCount: number;
  
    eventStatus: string;
  
    attackingBody: string;
  
    drone: {
      type: string;
      price: number;
    };
  }

@Injectable()
export class EventsRepository {
  private readonly mockEvent: EventType = {
    eventId: 1,
    interceptor: {
      interceptorTypeId: 1,
      type: 'PAC-3',
      price: 4000000,
    },
    launcher: {
      launcherId: 1,
      location: {
        lat: 31.7683,
        lng: 35.2137,
      },
    },
    region: 'מחוז ירושלים',
    time: '2026-09-08T18:05:44Z',
    eventLocation: {
      lat: 31.775,
      lng: 35.22,
    },
    interceptionStatus: 'לא יורט',
    droneInjuryCount: 3,
    eventStatus: 'נסגר',
    attackingBody: 'גורם מדינתי לא ידוע',
    drone: {
      type: 'LoadBee-M2',
      price: 8300,
    },
  };

  getMockEvent(): EventType {
    return this.mockEvent;
  }
}
