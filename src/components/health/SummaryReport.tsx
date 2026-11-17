import { Activity, AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";
import { STATUS_LABEL } from "@/lib/finance/analyze";
import { formatMoney, formatPct, type CurrencyCode } from "@/lib/finance/format";
import type { Analysis, HealthStatus } from "@/lib/finance/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Tone } from "./MetricCard";
import { metricViews } from "./metric-view";
import { ScoreGauge, SUMMARY } from "./ScoreCard";

const TONE_TEXT: Record<Tone, string> = {
  good: "text-success-strong",
  warn: "text-caution-strong",
  bad: "text-warning-strong",
  neutral: "text-foreground",
};
const TONE_RAIL: Record<Tone, string> = {
  good: "bg-success",
  warn: "bg-caution",
  bad: "bg-warning",
  neutral: "bg-muted-foreground",
};
const BAR: Record<HealthStatus, string> = { healthy: "bg-success", attention: "bg-caution", critical: "bg-warning" };
const INSIGHT_ICON = { good: CheckCircle2, warn: CircleAlert, bad: AlertTriangle } as const;

interface Props {
  analysis: Analysis;
  currency: CurrencyCode;
  sourceLabel: string;
  className?: string;
}

/** Printable one-page summary card. Hidden on screen; shown only when the page is printed / saved as PDF. */
export function SummaryReport({ analysis: a, currency, sourceLabel, className }: Props) {
  const metrics = metricViews(a, currency);
  const money = (n: number) => formatMoney(n, currency, false);
  const growth = (n: number | null) => (n == null ? "—" : `${n >= 0 ? "+" : ""}${n.toFixed(1)}% / mo`);
  const generated = new Date().toLocaleDateString(currency === "INR" ? "en-IN" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const figures = [
    { label: "Total revenue", value: money(a.totalRevenue) },
    { label: "Total expenses", value: money(a.totalExpenses) },
    { label: a.totalNetProfit >= 0 ? "Net profit" : "Net loss", value: money(a.totalNetProfit) },
    { label: "Revenue growth", value: growth(a.revenueGrowth) },
    { label: "Expense growth", value: growth(a.expenseGrowth) },
  ];

  return (
    <article className={cn("mx-auto w-full max-w-[760px] bg-card text-foreground", className)} aria-label="Financial health summary report">
      <header className="flex items-start justify-between border-b pb-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="size-4" strokeWidth={2.5} />
          </span>
          <div>
            <p className="font-display text-xl font-semibold leading-tight">Financial Health Summary</p>
            <p className="text-xs text-muted-foreground">Pulse · Financial Health Checker</p>
          </div>
        </div>
        <div className="text-right text-xs leading-relaxed text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">{sourceLabel}</span>
          </p>
          <p>
            {a.periodLabel} · {a.monthsCount} months
          </p>
          <p>Generated {generated}</p>
        </div>
      </header>

      <section className="mt-5 grid grid-cols-[220px_1fr] gap-5">
        <div className="flex flex-col items-center rounded-2xl border p-4">
          <Badge variant={a.status} className="rounded-full px-3 py-1 text-xs">
            {STATUS_LABEL[a.status]}
          </Badge>
          <ScoreGauge score={a.score} status={a.status} className="mt-2 size-40" numberClassName="text-5xl" />
          <p className="-mt-1 text-center text-xs leading-snug text-muted-foreground">{SUMMARY[a.status]}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div key={m.key} className="relative overflow-hidden rounded-2xl border p-3.5 pl-4">
              <span className={cn("absolute inset-y-0 left-0 w-1", TONE_RAIL[m.tone])} />
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={cn("mt-0.5 font-display text-2xl font-semibold tabular", TONE_TEXT[m.tone])}>{m.value}</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{m.caption}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 grid grid-cols-[220px_1fr] gap-5">
        <div className="rounded-2xl border p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Score breakdown</p>
          <div className="mt-3 space-y-2.5">
            {a.breakdown.map((b) => {
              const pct = (b.points / b.max) * 100;
              const tone: HealthStatus = pct >= 70 ? "healthy" : pct >= 40 ? "attention" : "critical";
              return (
                <div key={b.label}>
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium">{b.label}</span>
                    <span className="tabular text-muted-foreground">
                      {Math.round(b.points)}/{b.max}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", BAR[tone])} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Key figures · {a.periodLabel}
          </p>
          <dl className="mt-2 divide-y">
            {figures.map((f) => (
              <div key={f.label} className="flex items-baseline justify-between py-1.5 text-sm">
                <dt className="text-muted-foreground">{f.label}</dt>
                <dd className="font-semibold tabular">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">The honest read</p>
        <ul className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
          {a.insights.map((i) => {
            const Icon = INSIGHT_ICON[i.tone];
            return (
              <li key={i.title} className="flex gap-2.5 break-inside-avoid">
                <Icon className={cn("mt-0.5 size-4 shrink-0", TONE_TEXT[i.tone])} />
                <div>
                  <p className="text-sm font-semibold leading-snug">{i.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{i.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="mt-5 flex items-center justify-between border-t pt-3 text-[11px] text-muted-foreground">
        <span>Calculated privately in the browser. Not financial advice.</span>
        <span>
          Built by <span className="font-semibold text-foreground">Yuvakshi Chopra</span>
        </span>
      </footer>
    </article>
  );
}
