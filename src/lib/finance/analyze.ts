import { formatMonthLabel } from "./columns";
import { formatMoney, type CurrencyCode } from "./format";
import type { Analysis, HealthStatus, Insight, MonthRow } from "./types";

/** Score bands: 70+ is Healthy, 40–69 Needs Attention, below 40 Critical. */
export function statusFromScore(score: number): HealthStatus {
  if (score >= 70) return "healthy";
  if (score >= 40) return "attention";
  return "critical";
}

export const STATUS_LABEL: Record<HealthStatus, string> = {
  healthy: "Healthy",
  attention: "Needs Attention",
  critical: "Critical",
};

/** Months of cash left at the current burn. Infinity when the business isn't burning cash. */
export function computeRunway(cash: number, monthlyBurn: number): number {
  if (monthlyBurn <= 0) return Infinity;
  if (cash <= 0) return 0;
  return cash / monthlyBurn;
}

/** Piecewise-linear interpolation through sorted [x, y] points, clamped at both ends. */
function interp(x: number, pts: [number, number][]): number {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x0, y0] = pts[i - 1];
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return pts[pts.length - 1][1];
}

/** Compound monthly growth rate (%) across the last `window` months. */
function monthlyGrowth(values: number[], window = 6): number | null {
  const v = values.slice(-window);
  if (v.length < 2) return null;
  const first = v[0];
  const last = v[v.length - 1];
  if (first <= 0 || last <= 0) return null;
  return (Math.pow(last / first, 1 / (v.length - 1)) - 1) * 100;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const avg = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0);

/** Average monthly net cash burn over the last 3 months (0 if cash is growing). */
export function computeBurn(rows: MonthRow[]): number {
  const cash = rows.map((r) => r.cashBalance).filter((c): c is number => c != null);
  if (cash.length >= 2) {
    const recent = cash.slice(-4);
    const drops = recent.slice(1).map((c, i) => recent[i] - c);
    return Math.max(0, avg(drops));
  }
  return Math.max(0, -avg(rows.slice(-3).map((r) => r.netProfit)));
}

export function analyze(rows: MonthRow[], currency: CurrencyCode = "USD"): Analysis {
  const money = (n: number) => formatMoney(n, currency);
  const totalRevenue = sum(rows.map((r) => r.revenue));
  const totalCogs = sum(rows.map((r) => r.cogs));
  const totalNet = sum(rows.map((r) => r.netProfit));
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalCogs) / totalRevenue) * 100 : null;
  const netMargin = totalRevenue > 0 ? (totalNet / totalRevenue) * 100 : null;

  const cashRows = rows.filter((r) => r.cashBalance != null);
  const latestCash = cashRows.length ? (cashRows[cashRows.length - 1].cashBalance as number) : null;
  const burnRate = computeBurn(rows);
  const runwayMonths = latestCash != null ? computeRunway(latestCash, burnRate) : null;

  const revenueGrowth = monthlyGrowth(rows.map((r) => r.revenue));
  const expenseGrowth = monthlyGrowth(rows.map((r) => r.cogs + r.opex));

  const breakdown: Analysis["breakdown"] = [];
  if (runwayMonths != null) {
    const pts = Number.isFinite(runwayMonths)
      ? interp(runwayMonths, [[0, 0], [3, 5], [6, 12], [12, 24], [18, 30]])
      : 30;
    breakdown.push({ label: "Cash runway", points: pts, max: 30 });
  }
  if (netMargin != null)
    breakdown.push({ label: "Profitability", points: interp(netMargin, [[-100, 0], [-50, 4], [0, 12], [15, 20]]), max: 20 });
  if (grossMargin != null)
    breakdown.push({ label: "Gross margin", points: interp(grossMargin, [[0, 0], [40, 12], [70, 20]]), max: 20 });
  if (revenueGrowth != null)
    breakdown.push({ label: "Revenue growth", points: interp(revenueGrowth, [[-10, 0], [0, 8], [5, 14], [10, 20]]), max: 20 });
  if (revenueGrowth != null && expenseGrowth != null)
    breakdown.push({ label: "Cost discipline", points: interp(revenueGrowth - expenseGrowth, [[-5, 0], [0, 6], [3, 10]]), max: 10 });

  const maxTotal = sum(breakdown.map((b) => b.max));
  const score = maxTotal ? Math.round((sum(breakdown.map((b) => b.points)) / maxTotal) * 100) : 0;

  // ---- Insights: honest, plain-English, ranked by urgency ----
  const candidates: (Insight & { rank: number })[] = [];
  const latest = rows[rows.length - 1];

  if (runwayMonths != null) {
    if (!Number.isFinite(runwayMonths))
      candidates.push({ tone: "good", rank: 1, title: "You're not burning cash", body: "Your bank balance is holding steady or growing. Runway isn't the thing keeping you up at night — nice." });
    else if (runwayMonths < 6)
      candidates.push({ tone: "bad", rank: 10, title: `Only ~${runwayMonths.toFixed(1)} months of cash left`, body: `At ${money(burnRate)}/month, the bank account runs dry fast. Start fundraising or trimming costs this week, not next quarter.` });
    else if (runwayMonths < 12)
      candidates.push({ tone: "warn", rank: 7, title: `About ${runwayMonths.toFixed(1)} months of runway`, body: `Fine for today, but raising money usually takes 4–6 months. If a round is the plan, the clock has already started.` });
    else
      candidates.push({ tone: "good", rank: 2, title: `${runwayMonths.toFixed(0)}+ months of runway`, body: "You've got breathing room to make decisions calmly instead of desperately. Protect it." });
  }

  if (grossMargin != null) {
    if (grossMargin >= 60)
      candidates.push({ tone: "good", rank: 3, title: `Strong ${grossMargin.toFixed(0)}% gross margin`, body: "Each sale leaves plenty on the table after direct costs. That's the engine that can eventually pay for everything else." });
    else if (grossMargin >= 30)
      candidates.push({ tone: "warn", rank: 5, title: `Gross margin is ${grossMargin.toFixed(0)}%`, body: "Decent, not great. A small price bump or a cheaper supplier would drop straight to your bottom line." });
    else
      candidates.push({ tone: "bad", rank: 8, title: `Thin ${grossMargin.toFixed(0)}% gross margin`, body: "Most of every sale goes straight back out in direct costs. Growth alone won't fix this — pricing or costs need a look." });
  }

  if (revenueGrowth != null) {
    if (revenueGrowth >= 5)
      candidates.push({ tone: "good", rank: 4, title: `Revenue up ~${revenueGrowth.toFixed(1)}% a month`, body: "That's real momentum. Figure out exactly what's driving it and pour more fuel on it." });
    else if (revenueGrowth >= 0)
      candidates.push({ tone: "warn", rank: 4, title: "Revenue is mostly flat", body: `Growing ~${revenueGrowth.toFixed(1)}% a month. Not bad, but not enough to outrun your costs for long.` });
    else
      candidates.push({ tone: "bad", rank: 9, title: "Revenue is shrinking", body: `Down ~${Math.abs(revenueGrowth).toFixed(1)}% a month recently. Talk to recent churned customers — they'll tell you why.` });
  }

  if (revenueGrowth != null && expenseGrowth != null && expenseGrowth > revenueGrowth + 1)
    candidates.push({ tone: "bad", rank: 9, title: "Costs are outrunning revenue", body: `Expenses are growing ${expenseGrowth.toFixed(1)}% a month vs revenue at ${revenueGrowth.toFixed(1)}%. This is where money leaks — start with your biggest expense line.` });

  if (latest?.receivables != null && latest.revenue > 0 && latest.receivables > latest.revenue * 1.2)
    candidates.push({ tone: "warn", rank: 8, title: `${money(latest.receivables)} stuck in unpaid invoices`, body: "That's more than a month of revenue sitting in other people's bank accounts. Chasing it is the cheapest money you'll ever raise." });

  if (netMargin != null && totalRevenue > 0) {
    if (netMargin < 0) {
      const spendPerUnit = (totalRevenue - totalNet) / totalRevenue;
      candidates.push({ tone: netMargin < -50 ? "bad" : "warn", rank: netMargin < -50 ? 6 : 3, title: `You spend ${formatMoney(spendPerUnit, currency, false).replace(/\.00$/, "")}… for every ${formatMoney(1, currency, false)} earned`, body: `More precisely, ${spendPerUnit.toFixed(2)}× your revenue goes out the door. Normal for an early startup — as long as it's shrinking over time.` });
    } else if (netMargin >= 10)
      candidates.push({ tone: "good", rank: 3, title: `Profitable at ${netMargin.toFixed(0)}% net margin`, body: "You're keeping real money from every sale. That gives you options most startups don't have." });
  }

  const sorted = [...candidates].sort((a, b) => b.rank - a.rank);
  const concerns = sorted.filter((c) => c.tone !== "good").slice(0, 3);
  const goods = sorted.filter((c) => c.tone === "good");
  const picked = [...concerns, ...goods].slice(0, 4);
  if (goods.length && !picked.some((p) => p.tone === "good")) picked[picked.length - 1] = goods[0];
  const order = { bad: 0, warn: 1, good: 2 } as const;
  const insights = picked
    .sort((a, b) => order[a.tone] - order[b.tone])
    .map(({ tone, title, body }) => ({ tone, title, body }));

  const series = rows.map((r) => ({
    label: formatMonthLabel(r.month),
    revenue: r.revenue,
    expenses: r.cogs + r.opex,
    netProfit: r.netProfit,
    cash: r.cashBalance,
  }));

  return {
    score,
    status: statusFromScore(score),
    grossMargin,
    netMargin,
    burnRate,
    runwayMonths,
    latestCash,
    revenueGrowth,
    expenseGrowth,
    breakdown,
    insights,
    series,
    monthsCount: rows.length,
    periodLabel: rows.length ? `${series[0].label} – ${series[series.length - 1].label}` : "",
  };
}
