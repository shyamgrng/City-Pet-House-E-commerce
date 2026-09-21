/** Matches formatRs() in apps/web/src/lib/catalog-types.ts exactly (Indian digit grouping),
 * implemented manually instead of toLocaleString("en-IN") since Hermes (React Native's JS
 * engine) doesn't ship full ICU locale data by default and would silently fall back to
 * ungrouped digits. */
export function formatRs(n: number): string {
  const isNeg = n < 0;
  const value = Math.round(Math.abs(n));
  const s = String(value);
  let grouped: string;
  if (s.length <= 3) {
    grouped = s;
  } else {
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3);
    grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
  }
  return (isNeg ? "-" : "") + "Rs. " + grouped;
}
