import { describe, expect, it } from "vitest";
import { analyze, computeRunway, statusFromScore } from "./analyze";
import { buildRows, detectColumns, parseNumber } from "./columns";
import { SAMPLE_ROWS } from "./sample";

describe("health status bands", () => {
  it("70 and above is Healthy", () => {
    expect(statusFromScore(70)).toBe("healthy");
    expect(statusFromScore(100)).toBe("healthy");
  });
  it("40–69 is Needs Attention", () => {
    expect(statusFromScore(40)).toBe("attention");
    expect(statusFromScore(69)).toBe("attention");
  });
  it("below 40 is Critical", () => {
    expect(statusFromScore(39)).toBe("critical");
    expect(statusFromScore(0)).toBe("critical");
  });
});

describe("cash runway", () => {
  it("divides cash by monthly burn", () => {
    expect(computeRunway(120000, 20000)).toBe(6);
  });
  it("is infinite when not burning cash", () => {
    expect(computeRunway(50000, 0)).toBe(Infinity);
  });
});

describe("sample data", () => {
  it("reads as a growing startup with ~7 months runway that needs attention", () => {
    const a = analyze(SAMPLE_ROWS);
    expect(a.status).toBe("attention");
    expect(a.runwayMonths).toBeGreaterThan(6);
    expect(a.runwayMonths).toBeLessThan(8);
    expect(a.insights.length).toBeGreaterThanOrEqual(3);
    expect(a.insights.length).toBeLessThanOrEqual(4);
  });
});

describe("column detection & parsing", () => {
  it("maps common header names", () => {
    const m = detectColumns(["Period", "Total Sales", "Cost of Goods Sold", "Operating Costs", "Net Income", "Closing Cash", "A/R"]);
    expect(m).toMatchObject({
      month: "Period",
      revenue: "Total Sales",
      cogs: "Cost of Goods Sold",
      opex: "Operating Costs",
      netProfit: "Net Income",
      cashBalance: "Closing Cash",
      receivables: "A/R",
    });
  });
  it("parses accounting-style numbers", () => {
    expect(parseNumber("(1,200)")).toBe(-1200);
    expect(parseNumber("$45,000.50")).toBe(45000.5);
    expect(parseNumber("")).toBeNull();
  });
  it("computes net profit when the column is missing", () => {
    const rows = buildRows(
      { fileName: "x.csv", headers: ["Month", "Revenue", "COGS", "Opex"], rows: [{ Month: "Jan 2026", Revenue: "100", COGS: "20", Opex: "50" }] },
      { month: "Month", revenue: "Revenue", cogs: "COGS", opex: "Opex", netProfit: null, cashBalance: null, receivables: null },
    );
    expect(rows[0].netProfit).toBe(30);
  });
});
