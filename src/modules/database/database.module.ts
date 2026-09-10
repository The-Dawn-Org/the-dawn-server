import { Global, Module } from "@nestjs/common";
import { DataSource } from "typeorm";
import { DeploymentEntity } from "../entities/deployment.entity.js";
import { DronePositionEntity } from "../entities/drone-position.entity.js";
import { DroneTypeEntity } from "../entities/drone-type.entity.js";
import { DroneEntity } from "../entities/drone.entity.js";
import { InterceptionEntity } from "../entities/interception.entity.js";
import { InterceptorTypeEntity } from "../entities/interceptor-type.entity.js";
import { LauncherAmmunitionEntity } from "../entities/launcher-ammunition.entity.js";
import { LauncherTypeEntity } from "../entities/launcher-type.entity.js";
import { LiveLauncherEntity } from "../entities/live-launcher.entity.js";
import { DbStatusService } from "./db-status.service.js";

export const DB_CONNECTION = Symbol("DB_CONNECTION");

@Global()
@Module({
  providers: [
    DbStatusService,
    {
      provide: DB_CONNECTION,
      inject: [DbStatusService],
      useFactory: async (dbStatus: DbStatusService): Promise<DataSource> => {
        const dataSource = new DataSource({
          type: "postgres",
          host: process.env.DB_HOST || "d",
          port: Number(process.env.DB_PORT) || 5432,
          username: process.env.DB_USERNAME || "postgres",
          password: process.env.DB_PASSWORD || "postgres",
          database: process.env.DB_NAME || "hatzot",
          schema: "hatzot",
          entities: [
            DeploymentEntity,
            DronePositionEntity,
            DroneTypeEntity,
            DroneEntity,
            InterceptionEntity,
            InterceptorTypeEntity,
            LauncherAmmunitionEntity,
            LauncherTypeEntity,
            LiveLauncherEntity,
          ],
          synchronize: false,
        });

        try {
          await dataSource.initialize();
          dbStatus.setAvailable(true);
          console.log("DB connected ✅");
        } catch (err) {
          dbStatus.setAvailable(false);
          console.error(
            "DB unavailable, falling back to JSON:",
            (err as Error).message
          );
        }

        return dataSource;
      },
    },
  ],
  exports: [DB_CONNECTION, DbStatusService],
})
export class DatabaseModule {}
