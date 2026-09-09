export interface cardsInfo {
  totalCost: number;
  interceptorsLaunched: number;
  dronsesData: {
    count: number;
    totalCost: number;
  };
  budgetVariance: number;
  averageInterceptCost: number;
}

export interface DateRangeQuery {
  startDate: string;
  endDate: string;
}

export interface SystemCost {
  systemName: "Iron Dome" | "David's Sling" | "Arrow 2" | "Arrow 3";
  totalCost: number;
}

export type CostBySystem = SystemCost[];

export interface DailyInterceptions {
  date: string;
  dronesTotalCost: number;
  interceptorsTotalCost: number;
}

export type DailyInterceptionsData = DailyInterceptions[];
