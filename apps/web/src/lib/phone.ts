export const PHONE_PREFIX = "+977 ";

/** Strips the +977 prefix (and any non-digits) down to just the local digits. */
export function phoneDigits(value: string): string {
  return value.replace(PHONE_PREFIX, "").replace(/\D/g, "");
}

/** True only for a full, well-formed "+977 " + exactly 10 digits. */
export function isValidNepalPhone(value: string): boolean {
  return /^\+977 \d{10}$/.test(value);
}
