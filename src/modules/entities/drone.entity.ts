import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import type { DronePositionEntity } from "./drone-position.entity.js";
import type { DroneTypeEntity } from "./drone-type.entity.js";
import type { InterceptionEntity } from "./interception.entity.js";

@Entity({ name: "drone", schema: "hatzot" })
export class DroneEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "drone_type_id", type: "smallint" })
  droneTypeId!: number;

  @Column({ type: "double precision", nullable: true })
  heading!: number;

  @Column({ type: "double precision", nullable: true })
  velocity!: number;

  @ManyToOne("DroneTypeEntity", "drones")
  @JoinColumn({ name: "drone_type_id" })
  droneType!: DroneTypeEntity;

  @OneToMany("DronePositionEntity", "drone")
  positions!: DronePositionEntity[];

  @OneToMany("InterceptionEntity", "drone")
  interceptions!: InterceptionEntity[];
}
