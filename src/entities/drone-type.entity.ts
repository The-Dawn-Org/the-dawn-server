import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { DroneEntity } from "./drone.entity.js";

@Entity({ name: "drone_type", schema: "hatzot" })
export class DroneTypeEntity {
  @PrimaryGeneratedColumn({ type: "smallint" })
  id!: number;

  @Column({ type: "text", unique: true })
  name!: string;

  @Column({ type: "integer", nullable: true })
  price!: number;

  @OneToMany(() => DroneEntity, (drone) => drone.droneType)
  drones!: DroneEntity[];
}