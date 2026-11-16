import { useMemo } from "react";
import { CalendarClock, Columns3, Flame, Percent, RotateCcw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyze } from "@/lib/finance/analyze";
import { CURRENCIES, formatMoney, formatPct, type CurrencyCode } from "@/lib/finance/format";
import type { MonthRow } from "@/lib/finance/types";
import { CashChart, RevenueExpenseChart } from "./Charts";
import { Insights } from "./Insights";
import { MetricCard, type Tone } from "./MetricCard";
import { ScoreCard } from "./ScoreCard";

interface Props {
  rows: MonthRow[];
  sourceLabel: string;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  onRemap?: () => void;
  onReset: () => void;
}

export function Dashboard({ rows, sourceLabel, currency, onCurrencyChange, onRemap, onReset }: Props) {
  const a = useMemo(() => analyze(rows, currency), [rows, currency]);

  const gmTone: Tone = a.grossMargin == null ? "neutral" : a.grossMargin >= 60 ? "good" : a.grossMargin >= 30 ? "warn" : "bad";
  const nmTone: Tone = a.netMargin == null ? "neutral" : a.netMargin >= 10 ? "good" : a.netMargin >= 0 ? "warn" : "bad";
  const runwayTone: Tone =
    a.runwayMonths == null ? "neutral" : a.runwayMonths >= 12 ? "good" : a.runwayMonths >= 6 ? "warn" : "bad";
  const burnTone: Tone = a.burnRate === 0 ? "good" : runwayTone;

  const runwayValue =
    a.runwayMonths == null ? "—" : Number.isFinite(a.runwayMonths) ? `${a.runwayMonths.toFixed(1)} mo` : "∞";

  return (
    <section className="mx-auto w-full max-w-6xl animate-fade-up px-5 pt-4 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {sourceLabel} · {a.monthsCount} months · {a.periodLabel}
          </p>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Your financial health</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={currency} onValueChange={(v) => onCurrencyChange(v as CurrencyCode)}>
            <SelectTrigger className="h-9 w-[104px] bg-card" aria-label="Currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {onRemap && (
            <Button variant="outline" onClick={onRemap}>
              <Columns3 /> Adjust columns
            </Button>
          )}
          <Button onClick={onReset}>
            <RotateCcw /> Check another file
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <ScoreCard analysis={a} />
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            icon={Percent}
            label="Gross profit margin"
            value={formatPct(a.grossMargin)}
            caption="What's left of each sale after direct costs. 60%+ is great for software."
            tone={gmTone}
          />
          <MetricCard
            icon={TrendingUp}
            label="Net profit margin"
            value={formatPct(a.netMargin)}
            caption="What's left after every single expense, across the whole period."
            tone={nmTone}
          />
          <MetricCard
            icon={Flame}
            label="Monthly burn rate"
            value={a.burnRate === 0 ? "None" : formatMoney(a.burnRate, currency)}
            caption={
              a.burnRate === 0
                ? "You're not losing cash month to month. 🎉"
                : "Average cash going out each month (last 3 months)."
            }
            tone={burnTone}
          />
          <MetricCard
            icon={CalendarClock}
            label="Cash runway"
            value={runwayValue}
            caption={
              a.runwayMonths == null
                ? "Add a Cash Balance column to calculate this."
                : Number.isFinite(a.runwayMonths)
                  ? `${formatMoney(a.latestCash ?? 0, currency)} in the bank at today's burn.`
                  : "Cash isn't shrinking, so the runway is open-ended."
            }
            tone={runwayTone}
          />
        </div>
      </div>

      <div className="mt-4">
        <Insights insights={a.insights} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <RevenueExpenseChart analysis={a} currency={currency} />
        <CashChart analysis={a} currency={currency} />
      </div>
    </section>
  );
}
