import { ArrowLeft, ArrowRight, Check, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FIELDS, mappingIssues } from "@/lib/finance/columns";
import type { ColumnMapping, RawSheet } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const NONE = "__none__";

interface Props {
  sheet: RawSheet;
  mapping: ColumnMapping;
  onChange: (m: ColumnMapping) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export function ColumnMapper({ sheet, mapping, onChange, onBack, onConfirm }: Props) {
  const issues = mappingIssues(mapping);
  const preview = sheet.rows.slice(0, 4);

  return (
    <section className="mx-auto w-full max-w-4xl animate-fade-up px-5 pt-6 sm:px-8">
      <button
        onClick={onBack}
        className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Choose a different file
      </button>
      <div className="mt-5 flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-success-soft text-success-strong">
          <Columns3 className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Quick check: are these the right columns?</h1>
          <p className="mt-1.5 text-muted-foreground">
            We read <span className="font-medium text-foreground">{sheet.fileName}</span> ({sheet.rows.length} rows) and
            matched what we could. Fix anything that looks off.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl border bg-card p-4 shadow-card sm:grid-cols-2 sm:p-6">
        {FIELDS.map((f) => {
          const value = mapping[f.key];
          return (
            <div key={f.key} className="flex flex-col gap-1.5 rounded-xl p-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">
                  {f.label}
                  {f.required && <span className="text-warning"> *</span>}
                </label>
                {value && <Check className="size-4 text-success" />}
              </div>
              <Select
                value={value ?? NONE}
                onValueChange={(v) => onChange({ ...mapping, [f.key]: v === NONE ? null : v })}
              >
                <SelectTrigger className={cn("h-10 bg-card", !value && f.required && "border-warning/60")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>
                    <span className="text-muted-foreground">Not in my sheet</span>
                  </SelectItem>
                  {sheet.headers.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">{f.hint}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border bg-card shadow-card">
        <p className="border-b px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Preview
        </p>
        <table className="w-full text-sm tabular">
          <thead>
            <tr className="text-left text-muted-foreground">
              {sheet.headers.map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((r, i) => (
              <tr key={i} className="border-t">
                {sheet.headers.map((h) => (
                  <td key={h} className="whitespace-nowrap px-4 py-2">
                    {r[h] instanceof Date ? (r[h] as Date).toLocaleDateString() : String(r[h] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-warning-strong">
          {issues.map((i) => (
            <p key={i}>{i}</p>
          ))}
        </div>
        <Button size="xl" onClick={onConfirm} disabled={issues.length > 0}>
          Run health check <ArrowRight />
        </Button>
      </div>
    </section>
  );
}
