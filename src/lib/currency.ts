// Single source of truth for how money is written across the storefront.
// The store settles in Pakistani rupees, so every market shows the same
// currency — the country pickers are shipping-region pickers, not currency
// switchers.
export const CURRENCY_LABEL = "Rs";

/** "Rs 1,500" — rupees are quoted whole, so no decimal places. */
export function formatPrice(amount: number): string {
  return `${CURRENCY_LABEL} ${Math.round(amount).toLocaleString("en-PK")}`;
}
