import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { InterceptionEntity } from "./interception.entity.js";
import { LauncherAmmunitionEntity } from "./launcher-ammunition.entity.js";

@Entity({ name: "interceptor_type", schema: "hatzot" })
export class InterceptorTypeEntity {
  @PrimaryGeneratedColumn({ type: "smallint" })
  id!: number;

  @Column({ type: "text", unique: true })
  name!: string;

  @Column({ name: "range_m", type: "integer", nullable: true })
  rangeM!: number;

  @Column({ type: "integer", nullable: true })
  price!: number;

  @Column({ name: "estimated_success_rate", type: "jsonb", nullable: true })
  estimatedSuccessRate!: Record<string, any>;

  @Column({ type: "smallint", nullable: true })
  capacity!: number;

  @OneToMany(() => LauncherAmmunitionEntity, (ammo) => ammo.interceptorType)
  ammunition!: LauncherAmmunitionEntity[];

  @OneToMany(() => InterceptionEntity, (interception) => interception.interceptorType)
  interceptions!: InterceptionEntity[];
}