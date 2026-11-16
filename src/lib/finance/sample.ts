import type { MonthRow } from "./types";

/** Realistic 12-month seed-stage SaaS startup: growing revenue, steady burn, rising receivables. */
export const SAMPLE_ROWS: MonthRow[] = [
  { month: "2025-11", revenue: 18400, cogs: 4600, opex: 58000, netProfit: -44200, cashBalance: 873800, receivables: 21000 },
  { month: "2025-12", revenue: 21200, cogs: 5300, opex: 59500, netProfit: -43600, cashBalance: 826700, receivables: 24500 },
  { month: "2026-01", revenue: 23900, cogs: 6000, opex: 61000, netProfit: -43100, cashBalance: 780300, receivables: 27800 },
  { month: "2026-02", revenue: 26100, cogs: 6500, opex: 62400, netProfit: -42800, cashBalance: 734100, receivables: 31200 },
  { month: "2026-03", revenue: 29800, cogs: 7300, opex: 64800, netProfit: -42300, cashBalance: 687100, receivables: 35900 },
  { month: "2026-04", revenue: 31500, cogs: 7900, opex: 66200, netProfit: -42600, cashBalance: 642000, receivables: 38400 },
  { month: "2026-05", revenue: 34900, cogs: 8600, opex: 69500, netProfit: -43200, cashBalance: 594100, receivables: 43100 },
  { month: "2026-06", revenue: 37200, cogs: 9300, opex: 71800, netProfit: -43900, cashBalance: 545500, receivables: 47800 },
  { month: "2026-07", revenue: 40800, cogs: 10100, opex: 73000, netProfit: -42300, cashBalance: 498400, receivables: 52600 },
  { month: "2026-08", revenue: 43100, cogs: 10800, opex: 76400, netProfit: -44100, cashBalance: 449000, receivables: 57900 },
  { month: "2026-09", revenue: 47600, cogs: 11700, opex: 78900, netProfit: -43000, cashBalance: 400700, receivables: 63200 },
  { month: "2026-10", revenue: 51200, cogs: 12600, opex: 81500, netProfit: -42900, cashBalance: 351600, receivables: 69400 },
];

export function sampleCsv(): string {
  const header = "Month,Revenue,COGS,Operating Expenses,Net Profit,Cash Balance,Accounts Receivable";
  const lines = SAMPLE_ROWS.map((r) =>
    [r.month, r.revenue, r.cogs, r.opex, r.netProfit, r.cashBalance, r.receivables].join(","),
  );
  return [header, ...lines].join("\n");
}
