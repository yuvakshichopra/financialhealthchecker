import { useCallback, useRef, useState } from "react";
import {
  Lock,
  Sparkles,
  UploadCloud,
  Download,
  Loader2,
  Gauge,
  MessageSquareText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadBlob } from "@/lib/download";
import { sampleCsv } from "@/lib/finance/sample";

interface Props {
  onFile: (file: File) => void;
  onSample: () => void;
  busy: boolean;
  error: string | null;
}

export function UploadHero({ onFile, onSample, busy, error }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  const downloadTemplate = () => {
    downloadBlob(
      new Blob([sampleCsv()], { type: "text/csv;charset=utf-8" }),
      "pulse-financials-template.csv",
    );
  };

  return (
    <section className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-[520px] bg-grid"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-10 pt-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-card">
            <span className="size-1.5 rounded-full bg-success" /> For founders & small business
            owners
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
            Know if your business is
            <span className="text-success"> healthy</span> — in 10 seconds.
          </h1>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted-foreground">
            Drop in your monthly financial sheet and get a health score, burn rate, runway and an
            honest read on where your money is going.
          </p>
          <ul className="mt-8 grid max-w-lg gap-3 text-sm sm:grid-cols-3">
            {[
              { icon: Lock, text: "100% private, stays on your device" },
              { icon: Gauge, text: "Score out of 100 + 4 key metrics" },
              { icon: MessageSquareText, text: "Insights in plain English" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-muted-foreground">
                <Icon className="mt-0.5 size-4 shrink-0 text-success" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-up [animation-delay:120ms]">
          <div className="rounded-3xl border bg-card p-3 shadow-lift">
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload a CSV or Excel file"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all",
                dragging
                  ? "border-success bg-success-soft"
                  : "border-border bg-surface hover:border-success/50",
              )}
            >
              <span
                className={cn(
                  "grid size-14 place-items-center rounded-2xl bg-card shadow-card transition-transform",
                  dragging && "scale-110",
                )}
              >
                {busy ? (
                  <Loader2 className="size-6 animate-spin text-success" />
                ) : (
                  <UploadCloud className="size-6 text-success" />
                )}
              </span>
              <p className="mt-5 font-display text-lg font-semibold">
                {busy
                  ? "Reading your sheet…"
                  : dragging
                    ? "Drop it right here"
                    : "Drag & drop your financial sheet"}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                or{" "}
                <span className="font-semibold text-foreground underline underline-offset-4">
                  browse files
                </span>{" "}
                · CSV, XLSX, XLS
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="mx-2 mt-3 flex flex-col gap-2.5 rounded-2xl border bg-background p-3">
              <div className="text-xs leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">Not sure about the format?</p>
                <p>
                  One row per month: Month, Revenue, COGS, Operating Expenses, Net Profit, Cash
                  Balance, Receivables. Symbols like ₹ or $ and commas are fine.
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={downloadTemplate}>
                <Download /> Download Sample CSV Template
              </Button>
            </div>

            {error && (
              <p
                role="alert"
                className="mx-2 mt-3 rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning-strong"
              >
                {error}
              </p>
            )}

            <div className="flex items-center gap-3 px-2 py-4">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                no file handy?
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button size="xl" className="w-full" onClick={onSample} disabled={busy}>
              <Sparkles /> Try with Sample Data
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
