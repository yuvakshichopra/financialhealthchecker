import type { RawSheet } from "./types";

const isBlank = (v: unknown) => v == null || (typeof v === "string" && v.trim() === "");

/** Trims text cells and strips invisible characters (BOM, non-breaking spaces) that break matching. */
export function cleanCell(v: unknown): unknown {
  if (v == null) return "";
  if (typeof v === "string") return v.replace(/\ufeff/g, "").replace(/[\u00a0\u2007\u202f]/g, " ").trim();
  return v;
}

const textCells = (row: unknown[]) => row.filter((c) => typeof c === "string" && /[a-z]/i.test(c)).length;

/**
 * Turns a raw grid of cells (CSV or Excel) into a tidy sheet:
 * drops empty rows, skips title/notes rows above the real header row,
 * ignores unnamed columns, de-duplicates header names and drops repeated header rows.
 */
export function sheetFromMatrix(fileName: string, matrix: unknown[][]): RawSheet {
  const grid = matrix
    .map((r) => (Array.isArray(r) ? r.map(cleanCell) : []))
    .filter((r) => r.some((c) => !isBlank(c)));

  // Header = the first row (among the first 15) with the most text cells, needing at least 2.
  const scan = grid.slice(0, 15);
  const best = Math.max(0, ...scan.map(textCells));
  const headerIdx = best >= 2 ? scan.findIndex((r) => textCells(r) === best) : 0;
  const headerRow = grid[headerIdx] ?? [];

  const seen = new Map<string, number>();
  const columns: { idx: number; name: string }[] = [];
  headerRow.forEach((cell, idx) => {
    const base = String(cell ?? "").trim();
    if (!base) return;
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    columns.push({ idx, name: count > 1 ? `${base} (${count})` : base });
  });

  const headerKey = columns.map((c) => String(headerRow[c.idx]).toLowerCase()).join("|");
  const rows: Record<string, unknown>[] = [];
  for (const r of grid.slice(headerIdx + 1)) {
    if (columns.every((c) => isBlank(r[c.idx]))) continue;
    if (columns.map((c) => String(r[c.idx] ?? "").toLowerCase()).join("|") === headerKey) continue;
    const obj: Record<string, unknown> = {};
    for (const c of columns) obj[c.name] = r[c.idx] ?? "";
    rows.push(obj);
  }

  if (!columns.length || !rows.length)
    throw new Error("We couldn't find any rows. Make sure the first row has column names.");
  return { fileName, headers: columns.map((c) => c.name), rows };
}
