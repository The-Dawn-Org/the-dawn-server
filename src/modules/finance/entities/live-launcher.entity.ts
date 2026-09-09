import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import type { DeploymentEntity } from "./deployment.entity.js";
import type { InterceptionEntity } from "./interception.entity.js";
import type { LauncherAmmunitionEntity } from "./launcher-ammunition.entity.js";
import type { LauncherTypeEntity } from "./launcher-type.entity.js";

export enum LauncherStatus {
  ACTIVE = "ACTIVE",
  SAVED = "SAVED",
  DRAFT = "DRAFT",
}

@Entity({ name: "live_launcher", schema: "hatzot" })
export class LiveLauncherEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "launcher_type_id", type: "smallint" })
  launcherTypeId!: number;

  @Column({ name: "deployment_id", type: "smallint", nullable: true })
  deploymentId!: number;

  @Column({ type: "double precision", nullable: true })
  longitude!: number;

  @Column({ type: "double precision", nullable: true })
  latitude!: number;

  @Column({ type: "double precision", nullable: true })
  asl!: number;

  @Column({ type: "double precision", nullable: true })
  agl!: number;

  @Column({ type: "integer", nullable: true })
  amount!: number;

  @Column({ type: "boolean", default: true })
  active!: boolean;

  @Column({ type: "integer", nullable: true })
  range!: number;

  @Column({
    type: "enum",
    enum: LauncherStatus,
    enumName: "hatzot.launcher_status",
    default: LauncherStatus.DRAFT,
  })
  status!: LauncherStatus;

  @ManyToOne("DeploymentEntity", "launchers")
  @JoinColumn({ name: "deployment_id" })
  deployment!: DeploymentEntity;

  @ManyToOne("LauncherTypeEntity", "launchers")
  @JoinColumn({ name: "launcher_type_id" })
  launcherType!: LauncherTypeEntity;

  @OneToMany("LauncherAmmunitionEntity", "launcher")
  ammunition!: LauncherAmmunitionEntity[];

  @OneToMany("InterceptionEntity", "liveLauncher")
  interceptions!: InterceptionEntity[];
}
