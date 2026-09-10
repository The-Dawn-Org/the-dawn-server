import type { DroneType } from "./DroneType.js";
import type { InterceptorType } from "./InterceptorType.js";
import type { Launcher } from "./Launcher.js";
import type { Location } from "./Location.js";

export interface EventType {
  eventId: number;
  interceptor: Omit<InterceptorType, "maxRange">;
  launcher: Pick<Launcher, "launcherId" | "location"> & { launcherName: string };
  region: string;
  time: string;
  eventLocation: Location;
  interceptionStatus: string;
  droneInjuryCount: number;
  eventStatus: string;
  attackingBody: string;
  drone: Pick<DroneType, "type" | "price">;
}
