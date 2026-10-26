/** Format a number as Nigerian Naira, e.g. 12500 -> "₦12,500". */
export function formatNaira(amount: number, withDecimals = false): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(amount);
}

/** Compact form for tight UI, e.g. 12500 -> "₦12.5k". */
export function formatNairaCompact(amount: number): string {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}m`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(1)}k`;
  return `₦${amount}`;
}

export function formatKwh(kwh: number): string {
  return `${kwh.toFixed(1)} kWh`;
}