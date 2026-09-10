import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import type { DroneEntity } from "./drone.entity.js";

@Entity({ name: "drone_type", schema: "hatzot" })
export class DroneTypeEntity {
  @PrimaryGeneratedColumn({ type: "smallint" })
  id!: number;

  @Column({ type: "text", unique: true })
  name!: string;

  @Column({ type: "integer", nullable: true })
  price!: number;

  @OneToMany("DroneEntity", "droneType")
  drones!: DroneEntity[];
}
