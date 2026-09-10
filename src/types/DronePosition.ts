import type { Drone } from "./Drone.js";
import type { Location } from "./Location.js";

export interface DronePosition {
  dronePositionId: number;
  drone: Drone;
  location: Location;
  asl: number;
  agl: number;
}
