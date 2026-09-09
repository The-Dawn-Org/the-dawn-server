import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { LiveLauncherEntity } from "./live-launcher.entity.js";

@Entity({ name: "launcher_type", schema: "hatzot" })
export class LauncherTypeEntity {
  @PrimaryGeneratedColumn({ type: "smallint" })
  id!: number;

  @Column({ type: "text", unique: true })
  name!: string;

  @Column({ name: "reload_time_s", type: "numeric", nullable: true })
  reloadTimeS!: number;

  @Column({ name: "range_m", type: "integer", nullable: true })
  rangeM!: number;

  @OneToMany(() => LiveLauncherEntity, (launcher) => launcher.launcherType)
  launchers!: LiveLauncherEntity[];
}