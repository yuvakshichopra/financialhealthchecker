export type FieldKey =
  | "month"
  | "revenue"
  | "cogs"
  | "opex"
  | "netProfit"
  | "cashBalance"
  | "receivables";

export type ColumnMapping = Record<FieldKey, string | null>;

export interface RawSheet {
  fileName: string;
  headers: string[];
  rows: Record<string, unknown>[];
}

export interface MonthRow {
  month: string;
  revenue: number;
  cogs: number;
  opex: number;
  netProfit: number;
  cashBalance: number | null;
  receivables: number | null;
}

export type HealthStatus = "healthy" | "attention" | "critical";

export interface Insight {
  tone: "good" | "warn" | "bad";
  title: string;
  body: string;
}

export interface Analysis {
  score: number;
  status: HealthStatus;
  grossMargin: number | null;
  netMargin: number | null;
  burnRate: number;
  runwayMonths: number | null;
  latestCash: number | null;
  revenueGrowth: number | null;
  expenseGrowth: number | null;
  breakdown: { label: string; points: number; max: number }[];
  insights: Insight[];
  series: {
    label: string;
    revenue: number;
    expenses: number;
    netProfit: number;
    cash: number | null;
  }[];
  monthsCount: number;
  periodLabel: string;
}
