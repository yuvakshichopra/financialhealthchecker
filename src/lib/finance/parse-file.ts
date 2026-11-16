import type { RawSheet } from "./types";

const ACCEPTED = /\.(csv|xlsx|xls)$/i;

export function isAcceptedFile(file: File) {
  return ACCEPTED.test(file.name);
}

/** Parses CSV / Excel entirely in the browser. Libraries load on demand so nothing runs during SSR. */
export async function parseFinancialFile(file: File): Promise<RawSheet> {
  if (!isAcceptedFile(file)) throw new Error("Please upload a .csv, .xlsx or .xls file.");
  if (/\.csv$/i.test(file.name)) {
    const Papa = (await import("papaparse")).default;
    const text = await file.text();
    const result = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
    });
    const headers = (result.meta.fields ?? []).filter(Boolean);
    return finalize(file.name, headers, result.data);
  }

  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("That workbook has no sheets.");
  const ws = wb.Sheets[sheetName]!;
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: "",
    raw: true,
  });
  const headerRow = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, range: 0 })[0] ?? [];
  const headers = headerRow.map((h) => String(h ?? "").trim()).filter(Boolean);
  return finalize(file.name, headers, data);
}

function finalize(fileName: string, headers: string[], rows: Record<string, unknown>[]): RawSheet {
  if (!headers.length || !rows.length)
    throw new Error("We couldn't find any rows. Make sure the first row has column names.");
  return { fileName, headers, rows };
}
