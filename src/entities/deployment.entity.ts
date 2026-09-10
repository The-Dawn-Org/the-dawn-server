import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { LiveLauncherEntity } from "./live-launcher.entity.js";

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
    enumName: "deployment_status",
    default: DeploymentStatus.DRAFT,
  })
  status!: DeploymentStatus;

  @OneToMany(() => LiveLauncherEntity, (launcher) => launcher.deployment)
  launchers!: LiveLauncherEntity[];
}