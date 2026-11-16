export type CurrencyCode = "USD" | "INR" | "EUR" | "GBP";

export const CURRENCIES: { code: CurrencyCode; label: string }[] = [
  { code: "USD", label: "$ USD" },
  { code: "INR", label: "₹ INR" },
  { code: "EUR", label: "€ EUR" },
  { code: "GBP", label: "£ GBP" },
];

const locale = (c: CurrencyCode) => (c === "INR" ? "en-IN" : "en-US");

export function formatMoney(n: number, currency: CurrencyCode, compact = true) {
  return new Intl.NumberFormat(locale(currency), {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(n);
}

export function formatPct(n: number | null, digits = 1) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(digits)}%`;
}
