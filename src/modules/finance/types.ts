export interface cardsInfo {
    totalCost: number,
    interceptorsLaunced: number,
    dronsesData: {
        count: number,
        totalCost: number
    },
    budgetVariance: number,
    averageInterceptCost: number
}

export interface DateRangeQuery {
    startDate: string;
    endDate: string;
}

export interface SystemCost {
    system: "Iron Dome" | "David's Sling" | "Arrow 2" | "Arrow 3";
    cost: number;
}

export type CostBySystem = SystemCost[];

export interface DailyInterceptions {
    date: string;
    dronesIntercepted: number;
    totalCost: number;
}

export type DailyInterceptionsData = DailyInterceptions[];