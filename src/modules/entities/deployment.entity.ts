import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import type { LiveLauncherEntity } from "./live-launcher.entity.js";

export enum DeploymentStatus {
  REAL = "Real",
  SAVED = "Saved",
  DRAFT = "Draft",
}

@Entity({ name: "deployment", schema: "hatzot" })
export class DeploymentEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id!: number;

  @Column({ type: "text" })
  name!: string;

  @Column({
    type: "enum",
    enum: DeploymentStatus,
    enumName: "hatzot.deployment_status",
    default: DeploymentStatus.DRAFT,
  })
  status!: DeploymentStatus;

  @OneToMany("LiveLauncherEntity", "deployment")
  launchers!: LiveLauncherEntity[];
}
