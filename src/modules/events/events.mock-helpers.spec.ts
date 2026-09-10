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

describe("mapEntityToEventType", () => {
  it.each([
    [InterceptionStatus.PENDING, "ממתין"],
    [InterceptionStatus.IN_PROGRESS, "בתהליך"],
    [InterceptionStatus.SUCCESS, "הושלם בהצלחה"],
    [InterceptionStatus.FAILED, "נכשל"],
    [InterceptionStatus.ABORTED, "בוטל"],
  ])("translates status %s to Hebrew", (status, expected) => {
    expect(mapEntityToEventType(createEntity({ status })).eventStatus).toBe(
      expected
    );
  });

  it.each([
    [InterceptionResult.HIT, "יורט"],
    [InterceptionResult.MISS, "לא יורט"],
  ])("translates result %s to Hebrew", (result, expected) => {
    expect(
      mapEntityToEventType(createEntity({ result })).interceptionStatus
    ).toBe(expected);
  });

  it.each([
    [32.0853, 34.7818, "מחוז תל אביב"],
    [32.965, 35.5, "צפון"],
    [30.8, 34.8, "דרום"],
    [31.7683, 35.2137, "ירושלים"],
  ])("derives region from coordinates", (latitude, longitude, expected) => {
    const event = mapEntityToEventType(
      createEntity({
        interceptorLatitude: latitude,
        interceptorLongitude: longitude,
      })
    );

    expect(event.region).toBe(expected);
  });

  it("assigns Hezbollah to northern events and Hamas elsewhere", () => {
    const northernEvent = mapEntityToEventType(
      createEntity({ interceptorLatitude: 32.965, interceptorLongitude: 35.5 })
    );
    const southernEvent = mapEntityToEventType(
      createEntity({ interceptorLatitude: 30.8, interceptorLongitude: 34.8 })
    );

    expect(northernEvent.attackingBody).toBe("חיזבאללה");
    expect(southernEvent.attackingBody).toBe("חמאס");
  });

  it("generates a stable positive injury count only for missed interceptions", () => {
    const missedEntity = createEntity({ result: InterceptionResult.MISS });
    const firstMiss = mapEntityToEventType(missedEntity);
    const secondMiss = mapEntityToEventType(missedEntity);
    const hit = mapEntityToEventType(
      createEntity({ result: InterceptionResult.HIT })
    );

    expect(firstMiss.droneInjuryCount).toBeGreaterThanOrEqual(1);
    expect(firstMiss.droneInjuryCount).toBeLessThanOrEqual(5);
    expect(secondMiss.droneInjuryCount).toBe(firstMiss.droneInjuryCount);
    expect(hit.droneInjuryCount).toBe(0);
  });
});

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
});