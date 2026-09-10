import { Injectable } from "@nestjs/common";

@Injectable()
export class DbStatusService {
  private available = false;

  setAvailable(value: boolean): void {
    this.available = value;
  }

  isAvailable(): boolean {
    return this.available;
  }
}