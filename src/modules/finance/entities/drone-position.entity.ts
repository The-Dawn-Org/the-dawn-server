import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { DroneEntity } from "./drone.entity.js";

@Entity({ name: "drone_position", schema: "hatzot" })
export class DronePositionEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "drone_id", type: "bigint" })
  droneId!: string;

  @Column({ type: "double precision", nullable: true })
  longitude!: number;

  @Column({ type: "double precision", nullable: true })
  latitude!: number;

  @Column({ type: "double precision", nullable: true })
  asl!: number;

  @Column({ type: "double precision", nullable: true })
  agl!: number;

  @Column({ name: "recorded_at", type: "timestamptz", default: () => "now()" })
  recordedAt!: Date;

  @ManyToOne("DroneEntity", "positions")
  @JoinColumn({ name: "drone_id" })
  drone!: DroneEntity;
}
