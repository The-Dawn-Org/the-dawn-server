import { Injectable } from "@nestjs/common";

export interface MockData {
  id: number;
  message: string;
}

@Injectable()
export class EventsRepository {
  private readonly mockData: MockData[] = [
    { id: 1, message: "Hello World from Mock DB!" },
    { id: 2, message: "This is another mock item." },
  ];

  getMockData(): MockData[] {
    return this.mockData;
  }
}
