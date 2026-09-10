import type { InterceptorType } from "./InterceptorType.js";
import type { Launcher } from "./Launcher.js";

export interface LauncherAmmunition {
  launcher: Launcher;
  interceptorType: InterceptorType;
  quantity: number;
}
