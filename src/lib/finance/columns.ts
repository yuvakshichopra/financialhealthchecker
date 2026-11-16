import type { ColumnMapping, FieldKey, MonthRow, RawSheet } from "./types";

export const FIELDS: { key: FieldKey; label: string; required: boolean; hint: string }[] = [
  { key: "month", label: "Date / Month", required: true, hint: "One row per month" },
  { key: "revenue", label: "Revenue", required: true, hint: "Sales, income, turnover" },
  { key: "cogs", label: "COGS", required: false, hint: "Cost of goods / direct costs" },
  { key: "opex", label: "Operating Expenses", required: false, hint: "Salaries, rent, tools, marketing" },
  { key: "netProfit", label: "Net Profit", required: false, hint: "Calculated if missing" },
  { key: "cashBalance", label: "Cash Balance", required: false, hint: "Needed for runway" },
  { key: "receivables", label: "Receivables", required: false, hint: "Unpaid invoices (optional)" },
];

const EXACT: Record<FieldKey, string[]> = {
  month: ["month", "date", "period", "monthyear", "yearmonth", "mon"],
  revenue: ["revenue", "sales", "income", "totalrevenue", "turnover", "grossrevenue", "netsales", "totalsales", "mrr", "topline"],
  cogs: ["cogs", "costofgoodssold", "costofsales", "costofrevenue", "directcosts", "cos", "cogs$"],
  opex: ["opex", "operatingexpenses", "operatingexpense", "expenses", "totalexpenses", "operatingcosts", "overheads", "sga", "totalopex"],
  netProfit: ["netprofit", "netincome", "profit", "netprofitloss", "pnl", "netloss", "earnings", "profitloss", "netearnings"],
  cashBalance: ["cash", "cashbalance", "bankbalance", "cashonhand", "endingcash", "closingcash", "cashinbank", "balance"],
  receivables: ["receivables", "accountsreceivable", "ar", "outstandinginvoices", "debtors", "unpaidinvoices", "tradereceivables"],
};

const CONTAINS: [FieldKey, string[]][] = [
  ["cogs", ["cogs", "costofgoods", "costofsales", "costofrevenue", "directcost"]],
  ["netProfit", ["netprofit", "netincome", "netloss", "profitloss", "pnl"]],
  ["receivables", ["receivable", "debtor", "invoice"]],
  ["cashBalance", ["cash", "bank"]],
  ["opex", ["opex", "expense", "operatingcost", "overhead", "spend"]],
  ["revenue", ["revenue", "sales", "income", "turnover", "mrr"]],
  ["month", ["month", "date", "period"]],
];

export const normalizeHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, "");

export function emptyMapping(): ColumnMapping {
  return { month: null, revenue: null, cogs: null, opex: null, netProfit: null, cashBalance: null, receivables: null };
}

export function detectColumns(headers: string[]): ColumnMapping {
  const mapping = emptyMapping();
  const used = new Set<string>();
  const norm = headers.map((h) => ({ raw: h, n: normalizeHeader(h) }));

  for (const key of Object.keys(EXACT) as FieldKey[]) {
    const hit = norm.find((h) => !used.has(h.raw) && EXACT[key].includes(h.n));
    if (hit) {
      mapping[key] = hit.raw;
      used.add(hit.raw);
    }
  }
  for (const [key, needles] of CONTAINS) {
    if (mapping[key]) continue;
    const hit = norm.find((h) => !used.has(h.raw) && needles.some((s) => h.n.includes(s)));
    if (hit) {
      mapping[key] = hit.raw;
      used.add(hit.raw);
    }
  }
  return mapping;
}

export function mappingIssues(mapping: ColumnMapping): string[] {
  const issues: string[] = [];
  if (!mapping.month) issues.push("Pick the column that holds your months or dates.");
  if (!mapping.revenue) issues.push("Pick your revenue column.");
  if (!mapping.cogs && !mapping.opex && !mapping.netProfit)
    issues.push("Pick at least one cost column (COGS, Operating Expenses) or Net Profit.");
  return issues;
}

/** Parses "$1,200", "(1,200)", "-1200", "12.5%" into numbers. */
export function parseNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (v == null) return null;
  let s = String(v).trim();
  if (!s || s === "-" || s === "—") return null;
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  if (s.includes("-") && /^[^\d]*-/.test(s)) negative = true;
  const cleaned = s.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export function parseMonth(raw: unknown): Date | null {
  if (raw == null) return null;
  if (raw instanceof Date && !isNaN(raw.getTime())) return new Date(raw.getFullYear(), raw.getMonth(), 1);
  const s = String(raw).trim();
  let m: RegExpMatchArray | null;
  if ((m = s.match(/^(\d{4})[-/.](\d{1,2})(?:[-/.]\d{1,2})?/))) return new Date(+m[1]!, +m[2]! - 1, 1);
  if ((m = s.match(/^(\d{1,2})[-/.](\d{4})$/))) return new Date(+m[2]!, +m[1]! - 1, 1);
  if ((m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/))) {
    // Assume M/D/Y (Excel default export); month-level precision is all we need.
    const y = +m[3]! < 100 ? 2000 + +m[3]! : +m[3]!;
    return new Date(y, +m[1]! - 1, 1);
  }
  if ((m = s.match(/^([a-z]{3,9})[\s\-',.]*(\d{2,4})$/i))) {
    const idx = MONTHS.indexOf(m[1]!.slice(0, 3).toLowerCase());
    if (idx >= 0) return new Date(+m[2]! < 100 ? 2000 + +m[2]! : +m[2]!, idx, 1);
  }
  if (/^\d{5}(\.\d+)?$/.test(s)) {
    const serial = Number(s);
    if (serial > 20000 && serial < 80000) {
      const d = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
      return new Date(d.getUTCFullYear(), d.getUTCMonth(), 1);
    }
  }
  if (/\d{4}/.test(s)) {
    const t = Date.parse(s);
    if (!isNaN(t)) {
      const d = new Date(t);
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
  }
  return null;
}

export function formatMonthLabel(raw: string): string {
  const d = parseMonth(raw);
  if (!d) return raw;
  return `${MONTHS[d.getMonth()]!.replace(/^./, (c) => c.toUpperCase())} '${String(d.getFullYear()).slice(2)}`;
}

export function buildRows(sheet: RawSheet, mapping: ColumnMapping): MonthRow[] {
  const get = (row: Record<string, unknown>, key: FieldKey) =>
    mapping[key] ? row[mapping[key] as string] : undefined;

  const rows: MonthRow[] = [];
  for (const row of sheet.rows) {
    const monthRaw = get(row, "month");
    const month = monthRaw == null ? "" : String(monthRaw).trim();
    if (!month || /total|sum|average/i.test(month)) continue;
    const revenue = parseNumber(get(row, "revenue"));
    if (revenue == null) continue;

    const cogs = parseNumber(get(row, "cogs")) ?? 0;
    const np = parseNumber(get(row, "netProfit"));
    let opex = parseNumber(get(row, "opex"));
    // Expenses are often recorded as negatives; treat magnitudes as costs.
    const cogsAbs = Math.abs(cogs);
    if (opex == null) opex = np != null && !mapping.opex ? Math.max(0, revenue - cogsAbs - np) : 0;
    const opexAbs = Math.abs(opex);
    const netProfit = np ?? revenue - cogsAbs - opexAbs;

    rows.push({
      month,
      revenue,
      cogs: cogsAbs,
      opex: opexAbs,
      netProfit,
      cashBalance: parseNumber(get(row, "cashBalance")),
      receivables: parseNumber(get(row, "receivables")),
    });
  }

  const dated = rows.map((r) => ({ r, d: parseMonth(r.month) }));
  if (dated.length && dated.every((x) => x.d)) {
    dated.sort((a, b) => a.d!.getTime() - b.d!.getTime());
    return dated.map((x) => x.r);
  }
  return rows;
}
