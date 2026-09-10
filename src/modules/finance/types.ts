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
  systemName: string;
  totalCost: number;
}

export type CostBySystem = SystemCost[];

export interface DailyInterceptions {
  date: string;
  dronesTotalCost: number;
  interceptorsTotalCost: number;
}

export type DailyInterceptionsData = DailyInterceptions[];
