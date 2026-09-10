import { Inject, Injectable } from "@nestjs/common";
import { DataSource, In, Repository } from "typeorm";
import { FilterEventsDto } from "../../types/DTO/FilterEventsDto.js";
import { EventType } from "../../types/Event.js";
import { DB_CONNECTION } from "../database/database.module.js";
import mockEventsData from "../database/mocks/events.json" with { type: "json" };
import { withFallback } from "../database/with-fallback.js";
import { InterceptionEntity } from "../entities/interception.entity.js";
import {
  enrichMockEvent,
  filterMockEvents,
  findMockEventById,
  mapEntityToEventType,
} from "./events.mock-helpers.js";

@Injectable()
export class EventsRepository {
  private readonly mockEvents: EventType[] = (
    mockEventsData as EventType[]
  ).map(enrichMockEvent);

  constructor(
    @Inject(DB_CONNECTION) private readonly dataSource: DataSource,
  ) {}

  private get interceptionRepo(): Repository<InterceptionEntity> {
    return this.dataSource.getRepository(InterceptionEntity);
  }

  async getAllEvents(filterDto?: FilterEventsDto): Promise<EventType[]> {
    return withFallback(
      () => this.queryAllEvents(filterDto),
      () => filterMockEvents(this.mockEvents, filterDto),
    );
  }

  async getEventById(id: number): Promise<EventType> {
    return withFallback(
      () => this.queryEventById(id),
      () => findMockEventById(this.mockEvents, id),
    );
  }


  private async queryAllEvents(filterDto?: FilterEventsDto): Promise<EventType[]> {
    const query = this.interceptionRepo
      .createQueryBuilder("interception")
      .leftJoinAndSelect("interception.drone", "drone")
      .leftJoinAndSelect("drone.droneType", "droneType")
      .leftJoinAndSelect("interception.interceptorType", "interceptorType")
      .leftJoinAndSelect("interception.liveLauncher", "liveLauncher")
      .leftJoinAndSelect("liveLauncher.launcherType", "launcherType")
      .where("interception.status IN (:...allowedResults)", {
        allowedResults: ["SUCCESS", "FAILED"],
      });

    if (filterDto?.type?.length) {
      query.andWhere("interceptorType.name IN (:...types)", { types: filterDto.type });
    }

    if (filterDto?.startDate) {
      query.andWhere("interception.launchedAt >= :startDate", { startDate: filterDto.startDate });
    }

    if (filterDto?.endDate) {
      query.andWhere("interception.launchedAt <= :endDate", { endDate: filterDto.endDate });
    }

    const rawEntities = await query.getMany();
    return rawEntities.map(mapEntityToEventType);
  }

private async queryEventById(id: number): Promise<EventType> {
  const entity = await this.interceptionRepo.findOne({
    where: { 
      id: id.toString(),
      status: In(["SUCCESS", "FAILED"]),
    },
    relations: {
      drone: { droneType: true },
      interceptorType: true,
      liveLauncher: true,
    },
  });

  if (!entity) {
    throw new Error(`Event ${id} not found`);
  }

  return mapEntityToEventType(entity);
}
}