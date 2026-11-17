import { sheetFromMatrix } from "./clean-sheet";
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
    const text = (await file.text()).replace(/^\ufeff/, "");
    const result = Papa.parse<unknown[]>(text, { skipEmptyLines: "greedy" });
    return sheetFromMatrix(file.name, result.data);
  }

  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  if (!wb.SheetNames.length) throw new Error("That workbook has no sheets.");
  let lastError: unknown = null;
  // Use the first sheet that actually contains a table.
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    if (!ws) continue;
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "", raw: true, blankrows: false });
    try {
      return sheetFromMatrix(file.name, matrix);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("We couldn't find any rows in that workbook.");
}
