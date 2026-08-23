// A pet's age grows over time from a base age recorded at registration — it must never
// stay frozen at the value entered when the tag was created.
export function monthsBetween(from: Date, to: Date): number {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) months -= 1;
  return Math.max(0, months);
}

export function currentAgeMonths(tag: { ageYears: number; ageMonths: number; registeredDate: string }, asOf: Date = new Date()): number {
  const baseMonths = tag.ageYears * 12 + tag.ageMonths;
  const registered = new Date(tag.registeredDate);
  const elapsed = Number.isNaN(registered.getTime()) ? 0 : monthsBetween(registered, asOf);
  return baseMonths + elapsed;
}

export function formatAge(totalMonths: number): string {
  if (totalMonths < 1) return "Newborn";
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} month${months === 1 ? "" : "s"}`;
  if (months === 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years} year${years === 1 ? "" : "s"}, ${months} month${months === 1 ? "" : "s"}`;
}

export function displayAge(tag: { ageYears: number; ageMonths: number; registeredDate: string }, asOf: Date = new Date()): string {
  return formatAge(currentAgeMonths(tag, asOf));
}

// Parses a pre-rebuild free-text age like "5 years, 10 months" or "4 months" into
// years/months, so records saved before ageYears/ageMonths existed can be migrated
// instead of silently resetting to "Newborn".
export function parseLegacyAge(text: string): { years: number; months: number } | null {
  const years = Number(text.match(/(\d+)\s*year/)?.[1] ?? 0);
  const months = Number(text.match(/(\d+)\s*month/)?.[1] ?? 0);
  if (years === 0 && months === 0) return null;
  return { years, months };
}
