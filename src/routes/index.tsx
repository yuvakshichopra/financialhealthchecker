import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ColumnMapper } from "@/components/health/ColumnMapper";
import { Dashboard } from "@/components/health/Dashboard";
import { SiteFooter, SiteHeader } from "@/components/health/SiteChrome";
import { UploadHero } from "@/components/health/UploadHero";
import { buildRows, detectColumns } from "@/lib/finance/columns";
import type { CurrencyCode } from "@/lib/finance/format";
import { parseFinancialFile } from "@/lib/finance/parse-file";
import { SAMPLE_ROWS } from "@/lib/finance/sample";
import type { ColumnMapping, MonthRow, RawSheet } from "@/lib/finance/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse — Business Financial Health Checker for Founders" },
      {
        name: "description",
        content:
          "Upload your monthly CSV or Excel financials and get an instant health score, burn rate, cash runway and plain-English insights. 100% private.",
      },
      { property: "og:title", content: "Pulse — Business Financial Health Checker" },
      {
        property: "og:description",
        content: "Instant health score, burn rate, runway and honest insights from your financial sheet. Data never leaves your browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Stage =
  | { kind: "upload" }
  | { kind: "map"; sheet: RawSheet; mapping: ColumnMapping }
  | { kind: "dashboard"; rows: MonthRow[]; source: string; sheet?: RawSheet; mapping?: ColumnMapping };

function Index() {
  const [stage, setStage] = useState<Stage>({ kind: "upload" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  const handleFile = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const sheet = await parseFinancialFile(file);
      setStage({ kind: "map", sheet, mapping: detectColumns(sheet.headers) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't read that file.");
    } finally {
      setBusy(false);
    }
  };

  const confirmMapping = () => {
    if (stage.kind !== "map") return;
    const rows = buildRows(stage.sheet, stage.mapping);
    if (rows.length < 2) {
      setError("We need at least 2 months with a month and revenue value to run a check.");
      setStage({ kind: "upload" });
      return;
    }
    setStage({ kind: "dashboard", rows, source: stage.sheet.fileName, sheet: stage.sheet, mapping: stage.mapping });
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader className="print:hidden" />
      <main className="flex-1">
        {stage.kind === "upload" && (
          <UploadHero
            onFile={handleFile}
            onSample={() => {
              setError(null);
              setStage({ kind: "dashboard", rows: SAMPLE_ROWS, source: "Sample startup data" });
            }}
            busy={busy}
            error={error}
          />
        )}
        {stage.kind === "map" && (
          <ColumnMapper
            sheet={stage.sheet}
            mapping={stage.mapping}
            onChange={(mapping) => setStage({ ...stage, mapping })}
            onBack={() => setStage({ kind: "upload" })}
            onConfirm={confirmMapping}
          />
        )}
        {stage.kind === "dashboard" && (
          <Dashboard
            rows={stage.rows}
            sourceLabel={stage.source}
            currency={currency}
            onCurrencyChange={setCurrency}
            onRemap={
              stage.sheet && stage.mapping
                ? () => setStage({ kind: "map", sheet: stage.sheet!, mapping: stage.mapping! })
                : undefined
            }
            onReset={() => setStage({ kind: "upload" })}
          />
        )}
      </main>
      <SiteFooter className="print:hidden" />
    </div>
  );
}
