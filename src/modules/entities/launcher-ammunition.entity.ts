import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import type { InterceptionEntity } from "./interception.entity.js";
import type { InterceptorTypeEntity } from "./interceptor-type.entity.js";
import type { LiveLauncherEntity } from "./live-launcher.entity.js";

@Entity({ name: "launcher_ammunition", schema: "hatzot" })
export class LauncherAmmunitionEntity {
  @PrimaryColumn({ name: "launcher_id", type: "bigint" })
  launcherId!: string;

  @PrimaryColumn({ name: "interceptor_type_id", type: "smallint" })
  interceptorTypeId!: number;

  @Column({ type: "integer", default: 0 })
  quantity!: number;

  @ManyToOne("LiveLauncherEntity", "ammunition")
  @JoinColumn({ name: "launcher_id" })
  launcher!: LiveLauncherEntity;

  @ManyToOne("InterceptorTypeEntity", "ammunition")
  @JoinColumn({ name: "interceptor_type_id" })
  interceptorType!: InterceptorTypeEntity;

  @OneToMany("InterceptionEntity", "launcherAmmunition")
  interceptions!: InterceptionEntity[];
}
