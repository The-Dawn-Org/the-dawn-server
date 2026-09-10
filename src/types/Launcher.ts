import { LauncherType } from "./LauncherType.js";
import { Location } from "./Location.js";

export interface Launcher {
  launcherId: number;
  launcherType: LauncherType;
  location: Location;
  asl: number;
  agl: number;
  amount: number;
  active: boolean;
}
