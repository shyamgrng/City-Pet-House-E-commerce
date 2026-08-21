const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True for a plausible "name@domain.tld" address, e.g. abc@abc.com. */
export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
