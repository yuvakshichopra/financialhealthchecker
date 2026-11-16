import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tone = "good" | "warn" | "bad" | "neutral";

const TONE: Record<Tone, { chip: string; dot: string; label: string }> = {
  good: { chip: "bg-success-soft text-success-strong", dot: "bg-success", label: "Healthy" },
  warn: { chip: "bg-caution-soft text-caution-strong", dot: "bg-caution", label: "Watch" },
  bad: { chip: "bg-warning-soft text-warning-strong", dot: "bg-warning", label: "Concern" },
  neutral: { chip: "bg-muted text-muted-foreground", dot: "bg-muted-foreground", label: "Info" },
};

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  caption: string;
  tone: Tone;
}

export function MetricCard({ icon: Icon, label, value, caption, tone }: Props) {
  const t = TONE[tone];
  return (
    <div className="flex flex-col rounded-2xl border bg-card p-5 shadow-card transition-shadow hover:shadow-lift">
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-xl bg-surface text-foreground">
          <Icon className="size-4" />
        </span>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", t.chip)}>
          <span className={cn("size-1.5 rounded-full", t.dot)} />
          {t.label}
        </span>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold tabular">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{caption}</p>
    </div>
  );
}
