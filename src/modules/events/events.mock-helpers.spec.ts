import { describe, expect, it } from "vitest";
import {
    InterceptionEntity,
    InterceptionResult,
    InterceptionStatus,
} from "../entities/interception.entity.js";
import { enrichMockEvent, mapEntityToEventType } from "./events.mock-helpers.js";

function createEntity(
  overrides: Partial<InterceptionEntity> = {}
): InterceptionEntity {
  return {
    id: "42",
    launchedAt: new Date("2026-09-10T10:00:00Z"),
    interceptorLatitude: 32.0853,
    interceptorLongitude: 34.7818,
    status: InterceptionStatus.SUCCESS,
    result: InterceptionResult.HIT,
    interceptorType: { id: 1, name: "כיפת ברזל", price: 50000 },
    liveLauncher: { id: "1", latitude: 32.0853, longitude: 34.7818 },
    drone: { droneType: { name: "כטבם", price: 2500 } },
    ...overrides,
  } as InterceptionEntity;
}

describe("enrichMockEvent", () => {
  it("applies the generated DB response contract to fallback events", () => {
    const event = mapEntityToEventType(
      createEntity({
        id: "7",
        interceptorLatitude: 32.965,
        interceptorLongitude: 35.5,
        result: InterceptionResult.MISS,
      })
    );
    const enriched = enrichMockEvent({
      ...event,
      region: "legacy region",
      attackingBody: "legacy attacker",
      droneInjuryCount: 0,
    });

    expect(enriched.region).toBe("צפון");
    expect(enriched.attackingBody).toBe("חיזבאללה");
    expect(enriched.interceptionStatus).toBe("לא יורט");
    expect(enriched.droneInjuryCount).toBeGreaterThanOrEqual(1);
  });

  it("allows zero injuries for a failed interception", () => {
    const event = mapEntityToEventType(
      createEntity({
        id: "6",
        status: InterceptionStatus.FAILED,
        result: InterceptionResult.MISS,
      })
    );

    expect(event.interceptionStatus).toBe("לא יורט");
    expect(event.droneInjuryCount).toBe(0);
  });
});