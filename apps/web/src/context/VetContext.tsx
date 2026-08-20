"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { doctorSeed, vetBookingSeed } from "@/lib/vet-seed";
import { nowTime, type ChatMessage, type Doctor, type VetBooking, type VetStatus } from "@/lib/vet-types";

const DOCTORS_KEY = "cph_vet_doctors";
const BOOKINGS_KEY = "cph_vet_bookings";

type NewBookingInput = Omit<
  VetBooking,
  "id" | "status" | "paymentReceiptUploaded" | "callStartedByDoctor" | "chatMessages" | "clientDocuments" | "doctorDocuments" | "doctorNote" | "noteHistory" | "invoiceNumber" | "createdAt"
>;

type VetValue = {
  doctors: Doctor[];
  bookings: VetBooking[];
  ready: boolean;
  toggleDoctorOnline: (doctorId: string) => void;
  bookConsult: (input: NewBookingInput) => VetBooking;
  submitPayment: (bookingId: string) => void;
  approvePayment: (bookingId: string) => void;
  startCall: (bookingId: string) => void;
  endCall: (bookingId: string) => void;
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

export function VetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ doctors: Doctor[]; bookings: VetBooking[]; ready: boolean }>({
    doctors: doctorSeed,
    bookings: vetBookingSeed,
    ready: false,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ doctors: loadDoctors(), bookings: loadBookings(), ready: true });
  }, []);

  const persistDoctors = (doctors: Doctor[]) => window.localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
  const persistBookings = (bookings: VetBooking[]) => window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

  const updateBooking = (bookingId: string, patch: Partial<VetBooking> | ((b: VetBooking) => Partial<VetBooking>)) => {
    setState((s) => {
      const bookings = s.bookings.map((b) => (b.id === bookingId ? { ...b, ...(typeof patch === "function" ? patch(b) : patch) } : b));
      persistBookings(bookings);
      return { ...s, bookings };
    });
  };

  const toggleDoctorOnline = (doctorId: string) => {
    setState((s) => {
      const doctors = s.doctors.map((d) => (d.id === doctorId ? { ...d, online: !d.online } : d));
      persistDoctors(doctors);
      return { ...s, doctors };
    });
  };

  const bookConsult = (input: NewBookingInput): VetBooking => {
    const id = "VET-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const booking: VetBooking = {
      ...input,
      id,
      status: "Pending Payment",
      paymentReceiptUploaded: false,
      callStartedByDoctor: false,
      chatMessages: [],
      clientDocuments: [],
      doctorDocuments: [],
      doctorNote: "",
      noteHistory: [],
      invoiceNumber: "INV-" + id,
      createdAt: Date.now(),
    };
    setState((s) => {
      const bookings = [booking, ...s.bookings];
      persistBookings(bookings);
      return { ...s, bookings };
    });
    return booking;
  };

  const submitPayment = (bookingId: string) => {
    updateBooking(bookingId, { paymentReceiptUploaded: true, status: "Payment Review" as VetStatus });
  };

  const approvePayment = (bookingId: string) => {
    updateBooking(bookingId, { status: "Confirmed" as VetStatus });
  };

  const startCall = (bookingId: string) => {
    updateBooking(bookingId, { status: "In Progress" as VetStatus, callStartedByDoctor: true });
  };

  const endCall = (bookingId: string) => {
    updateBooking(bookingId, { status: "Completed" as VetStatus });
  };

  const sendMessage = (bookingId: string, from: ChatMessage["from"], text: string) => {
    if (!text.trim()) return;
    updateBooking(bookingId, (b) => ({ chatMessages: [...b.chatMessages, { from, text, time: nowTime() }] }));
  };

  const addClientDocument = (bookingId: string, name: string) => {
    updateBooking(bookingId, (b) => ({ clientDocuments: [...b.clientDocuments, { name }] }));
  };

  const addDoctorDocument = (bookingId: string, name: string) => {
    updateBooking(bookingId, (b) => ({ doctorDocuments: [...b.doctorDocuments, { name }] }));
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
        ready: state.ready,
        toggleDoctorOnline,
        bookConsult,
        submitPayment,
        approvePayment,
        startCall,
        endCall,
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
