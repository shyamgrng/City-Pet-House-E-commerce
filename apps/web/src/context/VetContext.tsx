"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { notifyEvent } from "@/lib/notify-client";
import { availabilitySeed, doctorSeed, vetBookingSeed } from "@/lib/vet-seed";
import {
  nowTime,
  type ActivityEntry,
  type ActivityType,
  type AvailabilityMap,
  type ChatMessage,
  type Doctor,
  type VetBooking,
  type VetStatus,
} from "@/lib/vet-types";

const DOCTORS_KEY = "cph_vet_doctors";
const BOOKINGS_KEY = "cph_vet_bookings";
const AVAILABILITY_KEY = "cph_vet_availability";
const ACTIVITY_KEY = "cph_vet_activity";
const ACTIVE_KEY = "cph_vet_page_active";

type NewBookingInput = Omit<
  VetBooking,
  | "id"
  | "status"
  | "paymentReceiptUploaded"
  | "receiptPhoto"
  | "callStartedByDoctor"
  | "chatMessages"
  | "clientDocuments"
  | "doctorDocuments"
  | "doctorNote"
  | "noteHistory"
  | "invoiceNumber"
  | "invoiceSent"
  | "createdAt"
>;

type VetValue = {
  doctors: Doctor[];
  bookings: VetBooking[];
  availability: AvailabilityMap;
  activityLog: ActivityEntry[];
  webVetActive: boolean;
  ready: boolean;
  saveError: string | null;
  addDoctor: (doctor: Doctor) => boolean;
  toggleDoctorOnline: (doctorId: string) => void;
  setDoctorFee: (doctorId: string, feeRs: number) => void;
  toggleAvailabilitySlot: (doctorId: string, date: string, time: string) => void;
  toggleWebVetActive: () => void;
  bookConsult: (input: NewBookingInput) => VetBooking | null;
  submitPayment: (bookingId: string, receiptPhoto: string) => boolean;
  approvePayment: (bookingId: string) => void;
  rejectPayment: (bookingId: string, reason: string) => void;
  finalizeBooking: (bookingId: string) => void;
  sendInvoice: (bookingId: string) => void;
  startCall: (bookingId: string) => void;
  endCall: (bookingId: string) => void;
  saveRecording: (bookingId: string) => void;
  sendMessage: (bookingId: string, from: ChatMessage["from"], text: string) => void;
  addClientDocument: (bookingId: string, name: string) => void;
  addDoctorDocument: (bookingId: string, name: string) => void;
  setDoctorNote: (bookingId: string, text: string) => void;
  cancelBooking: (bookingId: string) => void;
};

const VetContext = createContext<VetValue | null>(null);

function loadDoctors(): Doctor[] {
  try {
    const raw = window.localStorage.getItem(DOCTORS_KEY);
    return raw ? (JSON.parse(raw) as Doctor[]) : doctorSeed;
  } catch {
    return doctorSeed;
  }
}

function loadBookings(): VetBooking[] {
  try {
    const raw = window.localStorage.getItem(BOOKINGS_KEY);
    return raw ? (JSON.parse(raw) as VetBooking[]) : vetBookingSeed;
  } catch {
    return vetBookingSeed;
  }
}

function loadAvailability(): AvailabilityMap {
  try {
    const raw = window.localStorage.getItem(AVAILABILITY_KEY);
    return raw ? (JSON.parse(raw) as AvailabilityMap) : availabilitySeed;
  } catch {
    return availabilitySeed;
  }
}

function loadActivityLog(): ActivityEntry[] {
  try {
    const raw = window.localStorage.getItem(ACTIVITY_KEY);
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : [];
  } catch {
    return [];
  }
}

function loadWebVetActive(): boolean {
  try {
    const raw = window.localStorage.getItem(ACTIVE_KEY);
    return raw === null ? true : raw === "1";
  } catch {
    return true;
  }
}

export function VetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    doctors: Doctor[];
    bookings: VetBooking[];
    availability: AvailabilityMap;
    activityLog: ActivityEntry[];
    webVetActive: boolean;
    ready: boolean;
    saveError: string | null;
  }>({
    doctors: doctorSeed,
    bookings: vetBookingSeed,
    availability: availabilitySeed,
    activityLog: [],
    webVetActive: true,
    ready: false,
    saveError: null,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      doctors: loadDoctors(),
      bookings: loadBookings(),
      availability: loadAvailability(),
      activityLog: loadActivityLog(),
      webVetActive: loadWebVetActive(),
      ready: true,
      saveError: null,
    });
  }, []);

  const STORAGE_FULL_MESSAGE = "Couldn't save — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.";

  // Each persist* helper does its own single setState call (success or failure) rather than
  // being nested inside a caller's setState updater -- a quota-exceeded error thrown from inside
  // a setState updater is treated by React as a render-time error and crashes to the error page,
  // instead of just failing the one save.
  const persistDoctors = (doctors: Doctor[]): boolean => {
    try {
      window.localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
    } catch {
      setState((s) => ({ ...s, saveError: STORAGE_FULL_MESSAGE }));
      return false;
    }
    setState((s) => ({ ...s, doctors, saveError: null }));
    return true;
  };

  const persistBookings = (bookings: VetBooking[]): boolean => {
    try {
      window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    } catch {
      setState((s) => ({ ...s, saveError: STORAGE_FULL_MESSAGE }));
      return false;
    }
    setState((s) => ({ ...s, bookings, saveError: null }));
    return true;
  };

  const persistAvailability = (availability: AvailabilityMap) => {
    try {
      window.localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(availability));
    } catch {
      setState((s) => ({ ...s, saveError: STORAGE_FULL_MESSAGE }));
      return;
    }
    setState((s) => ({ ...s, availability, saveError: null }));
  };

  const persistActivityLog = (activityLog: ActivityEntry[]) => {
    try {
      window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activityLog));
    } catch {
      // The activity log is a nice-to-have audit trail -- if storage is full, drop the new
      // entry rather than surfacing an error for something the user didn't directly act on.
      return;
    }
    setState((s) => ({ ...s, activityLog }));
  };

  const updateBooking = (bookingId: string, patch: Partial<VetBooking> | ((b: VetBooking) => Partial<VetBooking>)): boolean => {
    const bookings = state.bookings.map((b) => (b.id === bookingId ? { ...b, ...(typeof patch === "function" ? patch(b) : patch) } : b));
    return persistBookings(bookings);
  };

  const logActivity = (type: ActivityType, text: string) => {
    const entry: ActivityEntry = { id: Math.random().toString(36).slice(2, 9), type, text, ts: Date.now() };
    const activityLog = [entry, ...state.activityLog].slice(0, 500);
    persistActivityLog(activityLog);
  };

  const addDoctor = (doctor: Doctor): boolean => {
    return persistDoctors([...state.doctors, doctor]);
  };

  const toggleDoctorOnline = (doctorId: string) => {
    const doctors = state.doctors.map((d) => (d.id === doctorId ? { ...d, online: !d.online } : d));
    persistDoctors(doctors);
  };

  const setDoctorFee = (doctorId: string, feeRs: number) => {
    const doctors = state.doctors.map((d) => (d.id === doctorId ? { ...d, feeRs } : d));
    persistDoctors(doctors);
  };

  const toggleAvailabilitySlot = (doctorId: string, date: string, time: string) => {
    const forDoctor = state.availability[doctorId] ?? {};
    const openTimes = forDoctor[date] ?? [];
    const nextTimes = openTimes.includes(time) ? openTimes.filter((t) => t !== time) : [...openTimes, time];
    const availability: AvailabilityMap = { ...state.availability, [doctorId]: { ...forDoctor, [date]: nextTimes } };
    persistAvailability(availability);
  };

  const toggleWebVetActive = () => {
    const webVetActive = !state.webVetActive;
    try {
      window.localStorage.setItem(ACTIVE_KEY, webVetActive ? "1" : "0");
    } catch {
      // Not worth surfacing an error for a small on/off flag -- just update in-memory state.
    }
    setState((s) => ({ ...s, webVetActive }));
  };

  const bookConsult = (input: NewBookingInput): VetBooking | null => {
    const id = "VET-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const booking: VetBooking = {
      ...input,
      id,
      status: "Pending Payment",
      paymentReceiptUploaded: false,
      receiptPhoto: "",
      callStartedByDoctor: false,
      chatMessages: [],
      clientDocuments: [],
      doctorDocuments: [],
      doctorNote: "",
      noteHistory: [],
      invoiceNumber: "INV-" + id,
      invoiceSent: false,
      createdAt: Date.now(),
    };
    const ok = persistBookings([booking, ...state.bookings]);
    if (!ok) return null;
    logActivity("Booking", `${booking.ownerName} requested a consult with ${booking.doctorName}`);
    notifyEvent("vet_booked", booking.ownerEmail, booking.ownerName, {
      bookingId: booking.id,
      ownerName: booking.ownerName,
      petName: booking.petName,
      doctorName: booking.doctorName,
      scheduledDate: booking.scheduledDate,
      scheduledTime: booking.scheduledTime,
    });
    return booking;
  };

  const submitPayment = (bookingId: string, receiptPhoto: string): boolean => {
    const ok = updateBooking(bookingId, { paymentReceiptUploaded: true, receiptPhoto, status: "Payment Review" as VetStatus });
    if (!ok) return false;
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (booking) logActivity("Payment", `${booking.ownerName} submitted a payment receipt for approval`);
    return true;
  };

  const approvePayment = (bookingId: string) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    if (booking.instant) {
      updateBooking(bookingId, { status: "Confirmed" as VetStatus });
      logActivity("Approval", `Admin approved payment from ${booking.ownerName} — consult confirmed`);
      notifyEvent("vet_confirmed", booking.ownerEmail, booking.ownerName, {
        bookingId: booking.id,
        ownerName: booking.ownerName,
        petName: booking.petName,
        doctorName: booking.doctorName,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
      });
    } else {
      updateBooking(bookingId, { status: "Awaiting Doctor Reconfirm" as VetStatus });
      logActivity("Approval", `Admin approved payment from ${booking.ownerName} — awaiting doctor reconfirm`);
    }
  };

  const rejectPayment = (bookingId: string, reason: string) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    const ok = updateBooking(bookingId, { status: "Payment Rejected" as VetStatus, rejectReason: reason });
    if (!ok) return;
    logActivity("Payment", `Admin rejected payment receipt from ${booking.ownerName} — ${reason}`);
    notifyEvent("vet_payment_rejected", booking.ownerEmail, booking.ownerName, {
      bookingId: booking.id,
      ownerName: booking.ownerName,
      petName: booking.petName,
      doctorName: booking.doctorName,
      reason,
    });
  };

  const finalizeBooking = (bookingId: string) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    updateBooking(bookingId, { status: "Confirmed" as VetStatus });
    logActivity("Approval", `Admin confirmed ${booking.doctorName} is available — consult with ${booking.ownerName} finalized`);
    notifyEvent("vet_confirmed", booking.ownerEmail, booking.ownerName, {
      bookingId: booking.id,
      ownerName: booking.ownerName,
      petName: booking.petName,
      doctorName: booking.doctorName,
      scheduledDate: booking.scheduledDate,
      scheduledTime: booking.scheduledTime,
    });
  };

  const sendInvoice = (bookingId: string) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    updateBooking(bookingId, { invoiceSent: true });
    logActivity("Payment", `Invoice ${booking.invoiceNumber} emailed to ${booking.ownerEmail}`);
  };

  const startCall = (bookingId: string) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    updateBooking(bookingId, { status: "In Progress" as VetStatus, callStartedByDoctor: true });
    if (booking) logActivity("Call", `${booking.doctorName} started the video call with ${booking.ownerName}`);
  };

  const endCall = (bookingId: string) => {
    updateBooking(bookingId, { status: "Completed" as VetStatus });
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (booking) {
      logActivity("Call", `Call ended — session with ${booking.ownerName} completed`);
      notifyEvent("vet_completed", booking.ownerEmail, booking.ownerName, {
        bookingId: booking.id,
        ownerName: booking.ownerName,
        petName: booking.petName,
        doctorName: booking.doctorName,
      });
    }
  };

  const saveRecording = (bookingId: string) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    updateBooking(bookingId, (b) => ({
      doctorDocuments: [...b.doctorDocuments, { name: `Consult_Recording_${bookingId}.mp4`, ts: Date.now() }],
    }));
    if (booking) logActivity("Call", `Recording saved for the consult with ${booking.ownerName}`);
  };

  const sendMessage = (bookingId: string, from: ChatMessage["from"], text: string) => {
    if (!text.trim()) return;
    updateBooking(bookingId, (b) => ({ chatMessages: [...b.chatMessages, { from, text, time: nowTime() }] }));
  };

  const addClientDocument = (bookingId: string, name: string) => {
    updateBooking(bookingId, (b) => ({ clientDocuments: [...b.clientDocuments, { name, ts: Date.now() }] }));
  };

  const addDoctorDocument = (bookingId: string, name: string) => {
    updateBooking(bookingId, (b) => ({ doctorDocuments: [...b.doctorDocuments, { name, ts: Date.now() }] }));
  };

  const setDoctorNote = (bookingId: string, text: string) => {
    updateBooking(bookingId, (b) => ({
      doctorNote: text,
      noteHistory: [{ date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), doctor: b.doctorName, text }, ...b.noteHistory],
    }));
  };

  const cancelBooking = (bookingId: string) => {
    updateBooking(bookingId, { status: "Cancelled" as VetStatus });
  };

  return (
    <VetContext.Provider
      value={{
        doctors: state.doctors,
        bookings: state.bookings,
        availability: state.availability,
        activityLog: state.activityLog,
        webVetActive: state.webVetActive,
        ready: state.ready,
        saveError: state.saveError,
        addDoctor,
        toggleDoctorOnline,
        setDoctorFee,
        toggleAvailabilitySlot,
        toggleWebVetActive,
        bookConsult,
        submitPayment,
        approvePayment,
        rejectPayment,
        finalizeBooking,
        sendInvoice,
        startCall,
        endCall,
        saveRecording,
        sendMessage,
        addClientDocument,
        addDoctorDocument,
        setDoctorNote,
        cancelBooking,
      }}
    >
      {children}
    </VetContext.Provider>
  );
}

export function useVet() {
  const ctx = useContext(VetContext);
  if (!ctx) throw new Error("useVet must be used within VetProvider");
  return ctx;
}
