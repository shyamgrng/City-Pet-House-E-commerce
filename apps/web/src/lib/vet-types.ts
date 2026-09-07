export type Doctor = {
  id: string;
  name: string;
  qualification: string;
  nvcNumber: string;
  online: boolean;
  verified: boolean;
  consults: number;
  completed: number;
  feeRs: number;
};

/** doctorId -> date label -> list of open time slots for that date */
export type AvailabilityMap = Record<string, Record<string, string[]>>;

export const AVAILABILITY_SLOTS = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"];

export function next14Days(): string[] {
  const days: string[] = [];
  const base = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    if (i === 0) days.push("Today");
    else if (i === 1) days.push("Tomorrow");
    else days.push(d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
  }
  return days;
}

/** Turns the booking form's date/time chip labels (e.g. "Tomorrow", "9:00 AM") into an actual
 * timestamp, by re-deriving today's day offset from next14Days() the same way the booking form
 * generated the label in the first place. Returns null if either label doesn't parse -- callers
 * should treat that as "no gating info available" rather than fail the booking. */
export function computeScheduledAt(dateLabel: string, timeLabel: string): number | null {
  if (!dateLabel || !timeLabel) return null;
  const offset = next14Days().indexOf(dateLabel);
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

const CONSULT_WINDOW_MS = 60 * 60 * 1000;

/** Whether a doctor should be able to see/join this booking as an active consult right now.
 * Instant bookings are always actionable; a scheduled booking only becomes actionable within
 * an hour of its appointment time. Bookings from before this field existed (scheduledAt
 * missing) fall back to always-actionable rather than being silently locked out. */
export function isBookingActionable(booking: Pick<VetBooking, "instant" | "scheduledAt">): boolean {
  if (booking.instant) return true;
  if (!booking.scheduledAt) return true;
  return booking.scheduledAt - Date.now() <= CONSULT_WINDOW_MS;
}

export type VetStatus =
  | "Pending Payment"
  | "Payment Review"
  | "Awaiting Doctor Reconfirm"
  | "Payment Rejected"
  | "Confirmed"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export type ChatMessage = { from: "client" | "doctor"; text: string; time: string; ts: number; id?: number };
export type SharedDoc = { name: string; ts: number; from: "client" | "doctor"; url: string; kind: "image" | "video" | "file"; id?: number };

export type PrescriptionMedicine = { name: string; dosage: string; frequency: string; duration: string };
export type Prescription = {
  // Owner/pet details as they should appear on the letterhead -- seeded from the booking but
  // editable by the doctor (e.g. to fix a typo the client made at booking time) without
  // touching the underlying booking record.
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  petName: string;
  petSpecies: string;
  petAge: string;
  reason: string;
  history: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  advice: string;
  updatedAt: number;
  sentAt: number | null;
};

export type VetBooking = {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  petName: string;
  petSpecies: string;
  petAge: string;
  reason: string;
  doctorId: string;
  doctorName: string;
  instant: boolean;
  scheduledDate: string;
  scheduledTime: string;
  // Epoch ms for the actual appointment moment, derived from scheduledDate/scheduledTime at
  // booking time -- null for instant bookings (there's no future moment to gate on) and for
  // legacy bookings saved before this field existed.
  scheduledAt: number | null;
  amount: number;
  status: VetStatus;
  paymentReceiptUploaded: boolean;
  receiptPhoto: string;
  callStartedByDoctor: boolean;
  chatMessages: ChatMessage[];
  clientDocuments: SharedDoc[];
  doctorDocuments: SharedDoc[];
  invoiceNumber: string;
  invoiceSent: boolean;
  createdAt: number;
  rejectReason?: string;
  prescription: Prescription | null;
};

export const STATUS_COLORS: Record<VetStatus, string> = {
  "Pending Payment": "#C9962B",
  "Payment Review": "#C9962B",
  "Awaiting Doctor Reconfirm": "#1996C8",
  "Payment Rejected": "#D64545",
  Confirmed: "#1F7A4D",
  "In Progress": "#1F7A4D",
  Completed: "#8A96A3",
  Cancelled: "#D64545",
};

export type ActivityType = "Booking" | "Approval" | "Call" | "Payment" | "Reminder";
export type ActivityEntry = { id: string; type: ActivityType; text: string; ts: number };

export const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  Booking: "#1996C8",
  Approval: "#1F7A4D",
  Call: "#7A56C8",
  Payment: "#C9962B",
  Reminder: "#1996C8",
};

export function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

type TimelineStep = { icon: string; title: string; subtitle: string; done: boolean; current: boolean; isLast: boolean };

/** "Awaiting Doctor Reconfirm" and "Confirmed" both land on step 2 (Doctor Assigned). */
function timelineStepIndex(status: VetStatus): number {
  switch (status) {
    case "Pending Payment":
      return 0;
    case "Payment Review":
      return 1;
    case "Awaiting Doctor Reconfirm":
    case "Confirmed":
      return 2;
    case "In Progress":
      return 3;
    case "Completed":
      return 4;
    case "Cancelled":
    case "Payment Rejected":
      return -1;
  }
}

export function vetTimeline(booking: VetBooking): TimelineStep[] {
  const idx = timelineStepIndex(booking.status);
  const steps = [
    { icon: "1", title: "Booking Received", subtitle: "Your request has been sent to our team." },
    { icon: "2", title: "Payment Verified", subtitle: "Admin confirms your consult fee payment." },
    { icon: "3", title: "Doctor Assigned", subtitle: `${booking.doctorName} confirms your appointment.` },
    { icon: "📹", title: "Video Consult", subtitle: "Join the call when your doctor starts it." },
    { icon: "✓", title: "Completed", subtitle: "Consult finished — summary emailed to you." },
  ];
  return steps.map((s, i) => ({
    ...s,
    done: idx > i,
    current: idx === i,
    isLast: i === steps.length - 1,
  }));
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
