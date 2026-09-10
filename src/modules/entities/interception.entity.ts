import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DroneEntity } from "./drone.entity.js";
import { InterceptorTypeEntity } from "./interceptor-type.entity.js";
import { LauncherAmmunitionEntity } from "./launcher-ammunition.entity.js";
import { LiveLauncherEntity } from "./live-launcher.entity.js";

export enum InterceptionStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  ABORTED = "ABORTED",
}

export enum InterceptionResult {
  HIT = "HIT",
  MISS = "MISS",
}

@Entity({ name: "interception", schema: "hatzot" })
export class InterceptionEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "live_launcher_id", type: "bigint" })
  liveLauncherId!: string;

  @Column({ name: "interceptor_type_id", type: "smallint" })
  interceptorTypeId!: number;

  @Column({ name: "drone_id", type: "bigint" })
  droneId!: string;

  @Column({ name: "launched_at", type: "timestamptz", default: () => "now()" })
  launchedAt!: Date;

  @Column({
    name: "interceptor_longitude",
    type: "double precision",
    nullable: true,
  })
  interceptorLongitude!: number;

  @Column({
    name: "interceptor_latitude",
    type: "double precision",
    nullable: true,
  })
  interceptorLatitude!: number;

  @Column({ type: "smallint", default: 3 })
  priority!: number;

  @Column({
    type: "enum",
    enum: InterceptionStatus,
    enumName: "interception_status",
    default: InterceptionStatus.PENDING,
  })
  status!: InterceptionStatus;

  @Column({
    type: "enum",
    enum: InterceptionResult,
    enumName: "interception_result",
    nullable: true,
  })
  result!: InterceptionResult | null;

  @ManyToOne(() => LauncherAmmunitionEntity, (ammo) => ammo.interceptions)
  @JoinColumn([
    { name: "live_launcher_id", referencedColumnName: "launcherId" },
    { name: "interceptor_type_id", referencedColumnName: "interceptorTypeId" },
  ])
  launcherAmmunition!: LauncherAmmunitionEntity;

  @ManyToOne(() => LiveLauncherEntity, (launcher) => launcher.interceptions)
  @JoinColumn({ name: "live_launcher_id" })
  liveLauncher!: LiveLauncherEntity;

  @ManyToOne(() => InterceptorTypeEntity, (type) => type.interceptions)
  @JoinColumn({ name: "interceptor_type_id" })
  interceptorType!: InterceptorTypeEntity;

  @ManyToOne(() => DroneEntity, (drone) => drone.interceptions)
  @JoinColumn({ name: "drone_id" })
  drone!: DroneEntity;
}
