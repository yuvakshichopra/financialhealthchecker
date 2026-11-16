import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";
import type { Insight } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const STYLE = {
  good: { icon: CheckCircle2, wrap: "bg-success-soft text-success-strong", rail: "bg-success" },
  warn: { icon: CircleAlert, wrap: "bg-caution-soft text-caution-strong", rail: "bg-caution" },
  bad: { icon: AlertTriangle, wrap: "bg-warning-soft text-warning-strong", rail: "bg-warning" },
} as const;

export function Insights({ insights }: { insights: Insight[] }) {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-card">
      <h2 className="text-lg font-semibold">The honest read</h2>
      <p className="text-sm text-muted-foreground">What's working, and where money is leaking.</p>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {insights.map((i) => {
          const s = STYLE[i.tone];
          const Icon = s.icon;
          return (
            <li key={i.title} className="relative flex gap-3 overflow-hidden rounded-2xl border bg-background p-4 pl-5">
              <span className={cn("absolute inset-y-0 left-0 w-1", s.rail)} />
              <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", s.wrap)}>
                <Icon className="size-4" />
              </span>
              <div>
                <p className="font-semibold leading-snug">{i.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{i.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
