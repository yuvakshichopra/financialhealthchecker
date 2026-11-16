import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney, type CurrencyCode } from "@/lib/finance/format";
import type { Analysis } from "@/lib/finance/types";

const axis = { fontSize: 11, fill: "var(--muted-foreground)" };

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-5 h-72">{children}</div>
    </div>
  );
}

function MoneyTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  currency: CurrencyCode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-popover px-3 py-2 text-xs shadow-lift">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 tabular">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="ml-auto font-medium">{formatMoney(p.value, currency, false)}</span>
        </p>
      ))}
    </div>
  );
}

export function RevenueExpenseChart({ analysis, currency }: { analysis: Analysis; currency: CurrencyCode }) {
  return (
    <ChartCard title="Revenue vs. Expenses" subtitle="Monthly, with net profit as the line">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={analysis.series} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barGap={3}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} />
          <YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={(v) => formatMoney(v, currency)} width={64} />
          <Tooltip cursor={{ fill: "var(--muted)" }} content={<MoneyTooltip currency={currency} />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Bar dataKey="revenue" name="Revenue" fill="var(--chart-2)" radius={[5, 5, 0, 0]} maxBarSize={22} />
          <Bar dataKey="expenses" name="Expenses" fill="var(--chart-3)" radius={[5, 5, 0, 0]} maxBarSize={22} />
          <Line dataKey="netProfit" name="Net profit" stroke="var(--chart-1)" strokeWidth={2} dot={false} type="monotone" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CashChart({ analysis, currency }: { analysis: Analysis; currency: CurrencyCode }) {
  const hasCash = analysis.series.some((s) => s.cash != null);
  return (
    <ChartCard title="Cash balance" subtitle="How much is in the bank, month by month">
      {hasCash ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analysis.series} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="cashFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} />
            <YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={(v) => formatMoney(v, currency)} width={64} />
            <Tooltip content={<MoneyTooltip currency={currency} />} />
            <Area
              dataKey="cash"
              name="Cash"
              type="monotone"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              fill="url(#cashFill)"
              connectNulls
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="grid h-full place-items-center rounded-xl bg-surface text-center text-sm text-muted-foreground">
          <p className="max-w-xs">Add a Cash Balance column to your sheet to see this trend and your runway.</p>
        </div>
      )}
    </ChartCard>
  );
}
