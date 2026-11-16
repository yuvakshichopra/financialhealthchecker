import { Activity } from "lucide-react";
import type { ReactNode } from "react";

export function SiteHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="size-4" strokeWidth={2.5} />
        </span>
        <span className="font-display text-[15px] font-semibold tracking-tight">Pulse</span>
        <span className="hidden text-sm text-muted-foreground sm:inline">· Financial Health Checker</span>
      </div>
      {right}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-auto w-full max-w-6xl px-5 pb-8 pt-16 sm:px-8">
      <div className="flex flex-col items-center justify-between gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
        <span>Your data never leaves this browser. Not financial advice.</span>
        <span>
          Built by <span className="font-semibold text-foreground">Yuvakshi Chopra</span>
        </span>
      </div>
    </footer>
  );
}
