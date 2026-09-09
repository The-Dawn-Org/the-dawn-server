import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { LiveLauncherEntity } from "./live-launcher.entity.js";
import { InterceptorTypeEntity } from "./interceptor-type.entity.js";
import { InterceptionEntity } from "./interception.entity.js";

@Entity({ name: "launcher_ammunition", schema: "hatzot" })
export class LauncherAmmunitionEntity {
  @PrimaryColumn({ name: "launcher_id", type: "bigint" })
  launcherId!: string;

  @PrimaryColumn({ name: "interceptor_type_id", type: "smallint" })
  interceptorTypeId!: number;

  @Column({ type: "integer", default: 0 })
  quantity!: number;

  @ManyToOne(() => LiveLauncherEntity, (launcher) => launcher.ammunition)
  @JoinColumn({ name: "launcher_id" })
  launcher!: LiveLauncherEntity;

  @ManyToOne(() => InterceptorTypeEntity, (type) => type.ammunition)
  @JoinColumn({ name: "interceptor_type_id" })
  interceptorType!: InterceptorTypeEntity;

  @OneToMany(() => InterceptionEntity, (interception) => interception.launcherAmmunition)
  interceptions!: InterceptionEntity[];
}