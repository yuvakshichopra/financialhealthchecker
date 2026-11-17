import { describe, expect, it } from "vitest";
import { analyze } from "./analyze";
import { buildRows, detectColumns, parseNumber } from "./columns";
import { sheetFromMatrix } from "./clean-sheet";

describe("messy number cleaning", () => {
  it("strips rupee symbol and Indian-style commas", () => {
    expect(parseNumber("₹1,20,000")).toBe(120000);
    expect(parseNumber("Rs. 1,000")).toBe(1000);
    expect(parseNumber("INR 2,50,000.75")).toBe(250000.75);
  });
  it("strips dollar, euro and pound symbols", () => {
    expect(parseNumber("$ 45,000.50")).toBe(45000.5);
    expect(parseNumber("€1.234,56")).toBe(1234.56);
    expect(parseNumber("£12,000 ")).toBe(12000);
  });
  it("reads negatives in every common style", () => {
    expect(parseNumber("($1,200)")).toBe(-1200);
    expect(parseNumber("-₹500")).toBe(-500);
    expect(parseNumber("₹-500")).toBe(-500);
    expect(parseNumber("−500")).toBe(-500);
  });
  it("understands k, M, lakh and crore shorthand", () => {
    expect(parseNumber("$12.5k")).toBe(12500);
    expect(parseNumber("1.2M")).toBe(1200000);
    expect(parseNumber("₹3.5 L")).toBe(350000);
    expect(parseNumber("₹2 Cr")).toBe(20000000);
  });
  it("treats blanks and placeholders as empty", () => {
    expect(parseNumber("   ")).toBeNull();
    expect(parseNumber("N/A")).toBeNull();
    expect(parseNumber("—")).toBeNull();
  });
});

describe("messy sheet cleaning", () => {
  const matrix = [
    ["Acme Pvt Ltd — Monthly P&L FY26", "", ""],
    ["", "", ""],
    ["\ufeffMonth ", " Revenue (₹)", "Expenses", "Closing Cash"],
    ["Jan 2026", "₹1,00,000", "₹1,50,000", "₹12,00,000"],
    ["", "", "", ""],
    ["Feb 2026", " ₹ 1,10,000 ", "(₹1,55,000)", "₹11,55,000"],
    ["Month", "Revenue (₹)", "Expenses", "Closing Cash"],
    ["Mar 2026", "1,20,000", "1,60,000", "11,15,000"],
    ["Total", "3,30,000", "4,65,000", ""],
  ];

  it("skips title rows, blank rows and repeated headers", () => {
    const sheet = sheetFromMatrix("acme.csv", matrix);
    expect(sheet.headers).toEqual(["Month", "Revenue (₹)", "Expenses", "Closing Cash"]);
    expect(sheet.rows).toHaveLength(4); // Jan, Feb, Mar, Total
  });

  it("produces clean numbers for the ratios", () => {
    const sheet = sheetFromMatrix("acme.csv", matrix);
    const rows = buildRows(sheet, detectColumns(sheet.headers));
    expect(rows.map((r) => r.revenue)).toEqual([100000, 110000, 120000]);
    expect(rows.map((r) => r.opex)).toEqual([150000, 155000, 160000]);
    expect(rows.map((r) => r.cashBalance)).toEqual([1200000, 1155000, 1115000]);
    const a = analyze(rows, "INR");
    expect(a.netMargin).toBeCloseTo((-135000 / 330000) * 100, 5);
    expect(a.burnRate).toBe(42500);
  });
});
