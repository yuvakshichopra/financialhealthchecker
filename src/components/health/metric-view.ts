import { formatMoney, formatPct, type CurrencyCode } from "@/lib/finance/format";
import type { Analysis } from "@/lib/finance/types";
import type { Tone } from "./MetricCard";

export interface MetricView {
  key: "gross" | "net" | "burn" | "runway";
  label: string;
  value: string;
  caption: string;
  tone: Tone;
}

/** Display values, captions and colour tones for the 4 headline metrics (shared by dashboard and report). */
export function metricViews(a: Analysis, currency: CurrencyCode): MetricView[] {
  const gmTone: Tone = a.grossMargin == null ? "neutral" : a.grossMargin >= 60 ? "good" : a.grossMargin >= 30 ? "warn" : "bad";
  const nmTone: Tone = a.netMargin == null ? "neutral" : a.netMargin >= 10 ? "good" : a.netMargin >= 0 ? "warn" : "bad";
  const runwayTone: Tone =
    a.runwayMonths == null ? "neutral" : a.runwayMonths >= 12 ? "good" : a.runwayMonths >= 6 ? "warn" : "bad";
  const burnTone: Tone = a.burnRate === 0 ? "good" : runwayTone;

  return [
    {
      key: "gross",
      label: "Gross profit margin",
      value: formatPct(a.grossMargin),
      caption: "What's left of each sale after direct costs. 60%+ is great for software.",
      tone: gmTone,
    },
    {
      key: "net",
      label: "Net profit margin",
      value: formatPct(a.netMargin),
      caption: "What's left after every single expense, across the whole period.",
      tone: nmTone,
    },
    {
      key: "burn",
      label: "Monthly burn rate",
      value: a.burnRate === 0 ? "None" : formatMoney(a.burnRate, currency),
      caption:
        a.burnRate === 0
          ? "You're not losing cash month to month. 🎉"
          : "Average cash going out each month (last 3 months).",
      tone: burnTone,
    },
    {
      key: "runway",
      label: "Cash runway",
      value: a.runwayMonths == null ? "—" : Number.isFinite(a.runwayMonths) ? `${a.runwayMonths.toFixed(1)} mo` : "∞",
      caption:
        a.runwayMonths == null
          ? "Add a Cash Balance column to calculate this."
          : Number.isFinite(a.runwayMonths)
            ? `${formatMoney(a.latestCash ?? 0, currency)} in the bank at today's burn.`
            : "Cash isn't shrinking, so the runway is open-ended.",
      tone: runwayTone,
    },
  ];
}
