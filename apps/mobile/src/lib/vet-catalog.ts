// Matches the doctor seed in apps/web/src/lib/vet-seed.ts exactly.
export type VetDoctor = {
  id: string;
  name: string;
  qualification: string;
  nvcNumber: string;
  online: boolean;
  verified: boolean;
  feeRs: number;
};

export const VET_DOCTORS: VetDoctor[] = [
  { id: "doc-1", name: "Dr. Sujata Rai, BVSc & AH", qualification: "BVSc & AH, Tribhuvan University", nvcNumber: "NVC-1042", online: true, verified: true, feeRs: 800 },
  { id: "doc-2", name: "Dr. Bikash Shrestha, DVM", qualification: "DVM, Nepal Agriculture & Forestry University", nvcNumber: "NVC-0876", online: false, verified: true, feeRs: 800 },
  { id: "doc-3", name: "Dr. Anjali Gurung, BVSc & AH", qualification: "BVSc & AH, Tribhuvan University", nvcNumber: "NVC-1213", online: true, verified: false, feeRs: 750 },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Matches next14Days() in apps/web/src/lib/vet-types.ts -- "Today"/"Tomorrow" then weekday +
 * month/day, computed manually (not toLocaleDateString) since Hermes doesn't reliably ship
 * locale data for date formatting. */
export function next7Days(): string[] {
  const days: string[] = [];
  const base = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    if (i === 0) days.push("Today");
    else if (i === 1) days.push("Tomorrow");
    else days.push(`${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`);
  }
  return days;
}

export const TIME_SLOTS = ["10:00 AM", "12:30 PM", "2:00 PM", "4:30 PM"];

export const CONSULT_WINDOW_MS = 30 * 60 * 1000;

export function computeScheduledAt(dateLabel: string, timeLabel: string): number | null {
  const days = next7Days();
  const offset = days.indexOf(dateLabel);
  if (offset === -1) return null;
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(timeLabel.trim());
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

export function isBookingActionable(instant: boolean, scheduledAt: number | null): boolean {
  if (instant) return true;
  if (!scheduledAt) return true;
  return scheduledAt - Date.now() <= CONSULT_WINDOW_MS;
}
