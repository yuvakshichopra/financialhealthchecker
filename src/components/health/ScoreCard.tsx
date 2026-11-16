import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL } from "@/lib/finance/analyze";
import type { Analysis, HealthStatus } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const STROKE: Record<HealthStatus, string> = {
  healthy: "stroke-success",
  attention: "stroke-caution",
  critical: "stroke-warning",
};
const BAR: Record<HealthStatus, string> = {
  healthy: "bg-success",
  attention: "bg-caution",
  critical: "bg-warning",
};

const SUMMARY: Record<HealthStatus, string> = {
  healthy: "Solid fundamentals. Keep an eye on the details below.",
  attention: "Some good signs, but a few things need fixing soon.",
  critical: "Real risks here. Act on the insights below this week.",
};

export function ScoreCard({ analysis }: { analysis: Analysis }) {
  const { score, status, breakdown } = analysis;
  const r = 78;
  const c = 2 * Math.PI * r;
  const arc = 0.75; // 270° gauge
  const filled = (score / 100) * arc * c;

  return (
    <div className="flex h-full flex-col rounded-3xl border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Health score</h2>
        <Badge variant={status} className="rounded-full px-3 py-1 text-xs">
          {STATUS_LABEL[status]}
        </Badge>
      </div>

      <div className="relative mx-auto mt-4 size-52">
        <svg viewBox="0 0 200 200" className="size-full rotate-[135deg]">
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            strokeWidth="14"
            strokeLinecap="round"
            className="stroke-muted"
            strokeDasharray={`${arc * c} ${c}`}
          />
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            strokeWidth="14"
            strokeLinecap="round"
            className={cn(STROKE[status], "transition-[stroke-dasharray] duration-1000 ease-out")}
            strokeDasharray={`${filled} ${c}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-6xl font-semibold tabular">{score}</span>
          <span className="text-sm text-muted-foreground">out of 100</span>
        </div>
      </div>
      <p className="-mt-2 text-center text-sm text-muted-foreground">{SUMMARY[status]}</p>

      <div className="mt-6 space-y-3 border-t pt-5">
        {breakdown.map((b) => {
          const pct = (b.points / b.max) * 100;
          const tone: HealthStatus = pct >= 70 ? "healthy" : pct >= 40 ? "attention" : "critical";
          return (
            <div key={b.label}>
              <div className="flex justify-between text-xs">
                <span className="font-medium">{b.label}</span>
                <span className="tabular text-muted-foreground">
                  {Math.round(b.points)}/{b.max}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full", BAR[tone])} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
