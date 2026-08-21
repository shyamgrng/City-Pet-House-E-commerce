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
  toggleDoctorOnline: (doctorId: string) => void;
  setDoctorFee: (doctorId: string, feeRs: number) => void;
  toggleAvailabilitySlot: (doctorId: string, date: string, time: string) => void;
  toggleWebVetActive: () => void;
  bookConsult: (input: NewBookingInput) => VetBooking;
  submitPayment: (bookingId: string, receiptPhoto: string) => void;
  approvePayment: (bookingId: string) => void;
  rejectPayment: (bookingId: string) => void;
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
  }>({
    doctors: doctorSeed,
    bookings: vetBookingSeed,
    availability: availabilitySeed,
    activityLog: [],
    webVetActive: true,
    ready: false,
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
    });
  }, []);

  const persistDoctors = (doctors: Doctor[]) => window.localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
  const persistBookings = (bookings: VetBooking[]) => window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  const persistAvailability = (availability: AvailabilityMap) => window.localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(availability));
  const persistActivityLog = (activityLog: ActivityEntry[]) => window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activityLog));

  const updateBooking = (bookingId: string, patch: Partial<VetBooking> | ((b: VetBooking) => Partial<VetBooking>)) => {
    setState((s) => {
      const bookings = s.bookings.map((b) => (b.id === bookingId ? { ...b, ...(typeof patch === "function" ? patch(b) : patch) } : b));
      persistBookings(bookings);
      return { ...s, bookings };
    });
  };

  const logActivity = (type: ActivityType, text: string) => {
    setState((s) => {
      const entry: ActivityEntry = { id: Math.random().toString(36).slice(2, 9), type, text, ts: Date.now() };
      const activityLog = [entry, ...s.activityLog].slice(0, 500);
      persistActivityLog(activityLog);
      return { ...s, activityLog };
    });
  };

  const toggleDoctorOnline = (doctorId: string) => {
    setState((s) => {
      const doctors = s.doctors.map((d) => (d.id === doctorId ? { ...d, online: !d.online } : d));
      persistDoctors(doctors);
      return { ...s, doctors };
    });
  };

  const setDoctorFee = (doctorId: string, feeRs: number) => {
    setState((s) => {
      const doctors = s.doctors.map((d) => (d.id === doctorId ? { ...d, feeRs } : d));
      persistDoctors(doctors);
      return { ...s, doctors };
    });
  };

  const toggleAvailabilitySlot = (doctorId: string, date: string, time: string) => {
    setState((s) => {
      const forDoctor = s.availability[doctorId] ?? {};
      const openTimes = forDoctor[date] ?? [];
      const nextTimes = openTimes.includes(time) ? openTimes.filter((t) => t !== time) : [...openTimes, time];
      const availability: AvailabilityMap = { ...s.availability, [doctorId]: { ...forDoctor, [date]: nextTimes } };
      persistAvailability(availability);
      return { ...s, availability };
    });
  };

  const toggleWebVetActive = () => {
    setState((s) => {
      const webVetActive = !s.webVetActive;
      window.localStorage.setItem(ACTIVE_KEY, webVetActive ? "1" : "0");
      return { ...s, webVetActive };
    });
  };

  const bookConsult = (input: NewBookingInput): VetBooking => {
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
    setState((s) => {
      const bookings = [booking, ...s.bookings];
      persistBookings(bookings);
      return { ...s, bookings };
    });
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

  const submitPayment = (bookingId: string, receiptPhoto: string) => {
    updateBooking(bookingId, { paymentReceiptUploaded: true, receiptPhoto, status: "Payment Review" as VetStatus });
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (booking) logActivity("Payment", `${booking.ownerName} submitted a payment receipt for approval`);
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

  const rejectPayment = (bookingId: string) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    setState((s) => {
      const bookings = s.bookings.filter((b) => b.id !== bookingId);
      persistBookings(bookings);
      return { ...s, bookings };
    });
    logActivity("Payment", `Admin rejected payment receipt from ${booking.ownerName}`);
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
