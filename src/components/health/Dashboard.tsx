import { useMemo } from "react";
import {
  CalendarClock,
  Columns3,
  FileDown,
  Flame,
  Percent,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { analyze } from "@/lib/finance/analyze";
import { CURRENCIES, type CurrencyCode } from "@/lib/finance/format";
import type { MonthRow } from "@/lib/finance/types";
import { CashChart, RevenueExpenseChart } from "./Charts";
import { Insights } from "./Insights";
import { MetricCard } from "./MetricCard";
import { metricViews } from "./metric-view";
import { ScoreCard } from "./ScoreCard";
import { SummaryReport } from "./SummaryReport";

interface Props {
  rows: MonthRow[];
  sourceLabel: string;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  onRemap?: (() => void) | undefined;
  onReset: () => void;
}

export function Dashboard({
  rows,
  sourceLabel,
  currency,
  onCurrencyChange,
  onRemap,
  onReset,
}: Props) {
  const a = useMemo(() => analyze(rows, currency), [rows, currency]);

  const metrics = metricViews(a, currency);
  const icons = { gross: Percent, net: TrendingUp, burn: Flame, runway: CalendarClock } as const;

  return (
    <>
      <SummaryReport
        analysis={a}
        currency={currency}
        sourceLabel={sourceLabel}
        className="hidden print:block"
      />
      <section className="mx-auto w-full max-w-6xl animate-fade-up px-5 pt-4 sm:px-8 print:hidden">
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
            <Button
              variant="outline"
              onClick={() => window.print()}
              title="Opens a print-ready one-page summary. Choose “Save as PDF” to download it."
            >
              <FileDown /> Download Summary Report
            </Button>
            <Button onClick={onReset}>
              <RotateCcw /> Check another file
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <ScoreCard analysis={a} />
          <div className="grid gap-4 sm:grid-cols-2">
            {metrics.map((m) => (
              <MetricCard
                key={m.key}
                icon={icons[m.key]}
                label={m.label}
                value={m.value}
                caption={m.caption}
                tone={m.tone}
              />
            ))}
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
    </>
  );
}
