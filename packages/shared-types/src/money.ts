/**
 * All prices are stored and transmitted as whole-rupee integers (NPR has no
 * commonly-used sub-unit in retail pricing here). `Rs. 1,300` is a display
 * format only — never parse it back into a stored amount.
 */
export function formatNPR(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString("en-IN")}`;
}

/** Parses a user-typed amount field (digits/commas only) — not a formatted "Rs. x,xxx" string. */
export function parseNPRInput(raw: string): number {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid amount: "${raw}"`);
  }
  return Math.round(value);
}
