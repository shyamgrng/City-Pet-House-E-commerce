"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { notifyEvent } from "@/lib/notify-client";
import { supabase } from "@/lib/supabase";
import { availabilitySeed, doctorSeed, vetBookingSeed } from "@/lib/vet-seed";
import {
  type ActivityEntry,
  type ActivityType,
  type AvailabilityMap,
  type ChatMessage,
  type Doctor,
  type SharedDoc,
  type VetBooking,
  type VetStatus,
} from "@/lib/vet-types";

const DOCTORS_KEY = "cph_vet_doctors";
const BOOKINGS_KEY = "cph_vet_bookings";
const AVAILABILITY_KEY = "cph_vet_availability";
const ACTIVITY_KEY = "cph_vet_activity";
const ACTIVE_KEY = "cph_vet_page_active";

const STORAGE_FULL_MESSAGE = "Couldn't save — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.";
const CLOUD_ERROR_MESSAGE = "Couldn't save — check your internet connection and try again.";

type BookingCore = Omit<VetBooking, "chatMessages" | "clientDocuments" | "doctorDocuments">;
type BookingRow = { id: string; data: BookingCore };
type ChatRow = { id: number; booking_id: string; from: "client" | "doctor"; text: string; ts: number };
type DocRow = { id: number; booking_id: string; from: "client" | "doctor"; name: string; kind: SharedDoc["kind"]; url: string; ts: number };

function chatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function assembleBookings(bookingRows: BookingRow[], chatRows: ChatRow[], docRows: DocRow[]): VetBooking[] {
  return bookingRows.map((row) => {
    const chatMessages: ChatMessage[] = chatRows
      .filter((m) => m.booking_id === row.id)
      .sort((a, b) => a.ts - b.ts)
      .map((m) => ({ id: m.id, from: m.from, text: m.text, ts: m.ts, time: chatTime(m.ts) }));
    const docsFor = (from: "client" | "doctor"): SharedDoc[] =>
      docRows
        .filter((d) => d.booking_id === row.id && d.from === from)
        .sort((a, b) => a.ts - b.ts)
        .map((d) => ({ id: d.id, from: d.from, name: d.name, kind: d.kind, url: d.url, ts: d.ts }));
    return { ...row.data, id: row.id, chatMessages, clientDocuments: docsFor("client"), doctorDocuments: docsFor("doctor") };
  });
}

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
  sendMessage: (bookingId: string, from: ChatMessage["from"], text: string) => boolean;
  addClientDocument: (bookingId: string, doc: { name: string; url: string; kind: SharedDoc["kind"] }) => boolean;
  addDoctorDocument: (bookingId: string, doc: { name: string; url: string; kind: SharedDoc["kind"] }) => boolean;
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

  // Cloud mode (Supabase configured): bookings, chat, shared files, doctors, availability, and
  // the on/off setting all live in a shared database so every device sees the same data, and a
  // realtime subscription pushes other people's changes straight into local state. Local mode
  // (no Supabase env vars yet) falls back to the original per-browser localStorage behavior.
  useEffect(() => {
    let cancelled = false;

    if (!supabase) {
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
      return;
    }

    const db = supabase;

    (async () => {
      const [doctorsRes, bookingsRes, availRes, activityRes, chatRes, docsRes, settingsRes] = await Promise.all([
        db.from("vet_doctors").select("id, data"),
        db.from("vet_bookings").select("id, data"),
        db.from("vet_availability").select("data").eq("id", "default").maybeSingle(),
        db.from("vet_activity").select("id, type, text, ts").order("ts", { ascending: false }).limit(500),
        db.from("vet_chat_messages").select("*"),
        db.from("vet_shared_docs").select("*"),
        db.from("vet_settings").select("value").eq("id", "webVetActive").maybeSingle(),
      ]);

      if (cancelled) return;

      if (doctorsRes.error || bookingsRes.error) {
        setState((s) => ({ ...s, ready: true, saveError: CLOUD_ERROR_MESSAGE }));
        return;
      }

      let doctors = (doctorsRes.data ?? []).map((r) => r.data as Doctor);
      if (doctors.length === 0) {
        doctors = doctorSeed;
        void db.from("vet_doctors").upsert(doctorSeed.map((d) => ({ id: d.id, data: d })));
      }

      let bookingRows = (bookingsRes.data ?? []) as BookingRow[];
      if (bookingRows.length === 0) {
        bookingRows = vetBookingSeed.map((b) => {
          const { chatMessages: _chatMessages, clientDocuments: _clientDocuments, doctorDocuments: _doctorDocuments, ...core } = b;
          return { id: b.id, data: core };
        });
        void db.from("vet_bookings").upsert(bookingRows);
      }
      const bookings = assembleBookings(bookingRows, (chatRes.data ?? []) as ChatRow[], (docsRes.data ?? []) as DocRow[]);

      let availability = availRes.data?.data as AvailabilityMap | undefined;
      if (!availability) {
        availability = availabilitySeed;
        void db.from("vet_availability").upsert({ id: "default", data: availabilitySeed });
      }

      let webVetActive = settingsRes.data?.value as boolean | undefined;
      if (webVetActive === undefined) {
        webVetActive = true;
        void db.from("vet_settings").upsert({ id: "webVetActive", value: true });
      }

      const activityLog = (activityRes.data ?? []) as ActivityEntry[];

      if (!cancelled) setState({ doctors, bookings, availability, activityLog, webVetActive, ready: true, saveError: null });
    })();

    const channel = db
      .channel("vet-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "vet_bookings" }, (payload) => {
        if (payload.eventType === "DELETE") return;
        const row = payload.new as unknown as BookingRow;
        setState((s) => {
          const existing = s.bookings.find((b) => b.id === row.id);
          const merged: VetBooking = {
            ...row.data,
            id: row.id,
            chatMessages: existing?.chatMessages ?? [],
            clientDocuments: existing?.clientDocuments ?? [],
            doctorDocuments: existing?.doctorDocuments ?? [],
          };
          return { ...s, bookings: existing ? s.bookings.map((b) => (b.id === row.id ? merged : b)) : [merged, ...s.bookings] };
        });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "vet_chat_messages" }, (payload) => {
        const row = payload.new as unknown as ChatRow;
        setState((s) => ({
          ...s,
          bookings: s.bookings.map((b) => {
            if (b.id !== row.booking_id) return b;
            if (b.chatMessages.some((m) => m.ts === row.ts && m.from === row.from && m.text === row.text)) return b;
            const msg: ChatMessage = { id: row.id, from: row.from, text: row.text, ts: row.ts, time: chatTime(row.ts) };
            return { ...b, chatMessages: [...b.chatMessages, msg] };
          }),
        }));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "vet_shared_docs" }, (payload) => {
        const row = payload.new as unknown as DocRow;
        const field = row.from === "client" ? "clientDocuments" : "doctorDocuments";
        setState((s) => ({
          ...s,
          bookings: s.bookings.map((b) => {
            if (b.id !== row.booking_id) return b;
            if (b[field].some((d) => d.ts === row.ts && d.name === row.name)) return b;
            const doc: SharedDoc = { id: row.id, from: row.from, name: row.name, kind: row.kind, url: row.url, ts: row.ts };
            return { ...b, [field]: [...b[field], doc] };
          }),
        }));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "vet_doctors" }, (payload) => {
        if (payload.eventType === "DELETE") return;
        const row = payload.new as unknown as { id: string; data: Doctor };
        setState((s) => ({
          ...s,
          doctors: s.doctors.some((d) => d.id === row.id) ? s.doctors.map((d) => (d.id === row.id ? row.data : d)) : [...s.doctors, row.data],
        }));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "vet_availability" }, (payload) => {
        if (payload.eventType === "DELETE") return;
        const row = payload.new as unknown as { id: string; data: AvailabilityMap };
        if (row.id !== "default") return;
        setState((s) => ({ ...s, availability: row.data }));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "vet_activity" }, (payload) => {
        const row = payload.new as unknown as ActivityEntry;
        setState((s) => (s.activityLog.some((e) => e.id === row.id) ? s : { ...s, activityLog: [row, ...s.activityLog].slice(0, 500) }));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "vet_settings" }, (payload) => {
        if (payload.eventType === "DELETE") return;
        const row = payload.new as unknown as { id: string; value: boolean };
        if (row.id !== "webVetActive") return;
        setState((s) => ({ ...s, webVetActive: row.value }));
      })
      .subscribe();

    return () => {
      cancelled = true;
      void db.removeChannel(channel);
    };
  }, []);

  // Each persist* helper does its own single setState call (success or failure) rather than
  // being nested inside a caller's setState updater -- a quota-exceeded error thrown from inside
  // a setState updater is treated by React as a render-time error and crashes to the error page,
  // instead of just failing the one save. (Local/no-Supabase mode only.)
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
    const current = state.bookings.find((b) => b.id === bookingId);
    if (!current) return false;
    const patched: VetBooking = { ...current, ...(typeof patch === "function" ? patch(current) : patch) };

    if (supabase) {
      const db = supabase;
      setState((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === bookingId ? patched : b)), saveError: null }));
      const { chatMessages: _chatMessages, clientDocuments: _clientDocuments, doctorDocuments: _doctorDocuments, ...core } = patched;
      void db
        .from("vet_bookings")
        .upsert({ id: bookingId, data: core, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) setState((s) => ({ ...s, saveError: CLOUD_ERROR_MESSAGE }));
        });
      return true;
    }

    const bookings = state.bookings.map((b) => (b.id === bookingId ? patched : b));
    return persistBookings(bookings);
  };

  const addDocument = (bookingId: string, from: SharedDoc["from"], doc: { name: string; url: string; kind: SharedDoc["kind"] }): boolean => {
    const field: "clientDocuments" | "doctorDocuments" = from === "client" ? "clientDocuments" : "doctorDocuments";
    const ts = Date.now();

    if (supabase) {
      const db = supabase;
      setState((s) => ({
        ...s,
        bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, [field]: [...b[field], { ...doc, ts, from }] } : b)),
        saveError: null,
      }));
      void db
        .from("vet_shared_docs")
        .insert({ booking_id: bookingId, from, name: doc.name, kind: doc.kind, url: doc.url, ts })
        .then(({ error }) => {
          if (error) setState((s) => ({ ...s, saveError: CLOUD_ERROR_MESSAGE }));
        });
      return true;
    }

    return updateBooking(bookingId, (b) => ({ [field]: [...b[field], { ...doc, ts, from }] }) as Partial<VetBooking>);
  };

  const logActivity = (type: ActivityType, text: string) => {
    const entry: ActivityEntry = { id: Math.random().toString(36).slice(2, 9), type, text, ts: Date.now() };
    if (supabase) {
      const db = supabase;
      setState((s) => ({ ...s, activityLog: [entry, ...s.activityLog].slice(0, 500) }));
      void db.from("vet_activity").insert(entry);
      return;
    }
    const activityLog = [entry, ...state.activityLog].slice(0, 500);
    persistActivityLog(activityLog);
  };

  const addDoctor = (doctor: Doctor): boolean => {
    if (supabase) {
      const db = supabase;
      setState((s) => ({ ...s, doctors: [...s.doctors, doctor], saveError: null }));
      void db
        .from("vet_doctors")
        .insert({ id: doctor.id, data: doctor })
        .then(({ error }) => {
          if (error) setState((s) => ({ ...s, saveError: CLOUD_ERROR_MESSAGE }));
        });
      return true;
    }
    return persistDoctors([...state.doctors, doctor]);
  };

  const updateDoctor = (doctorId: string, patch: Partial<Doctor>) => {
    const current = state.doctors.find((d) => d.id === doctorId);
    if (!current) return;
    const changed = { ...current, ...patch };
    if (supabase) {
      const db = supabase;
      setState((s) => ({ ...s, doctors: s.doctors.map((d) => (d.id === doctorId ? changed : d)), saveError: null }));
      void db
        .from("vet_doctors")
        .upsert({ id: doctorId, data: changed, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) setState((s) => ({ ...s, saveError: CLOUD_ERROR_MESSAGE }));
        });
      return;
    }
    persistDoctors(state.doctors.map((d) => (d.id === doctorId ? changed : d)));
  };

  const toggleDoctorOnline = (doctorId: string) => {
    const current = state.doctors.find((d) => d.id === doctorId);
    if (current) updateDoctor(doctorId, { online: !current.online });
  };

  const setDoctorFee = (doctorId: string, feeRs: number) => {
    updateDoctor(doctorId, { feeRs });
  };

  const toggleAvailabilitySlot = (doctorId: string, date: string, time: string) => {
    const forDoctor = state.availability[doctorId] ?? {};
    const openTimes = forDoctor[date] ?? [];
    const nextTimes = openTimes.includes(time) ? openTimes.filter((t) => t !== time) : [...openTimes, time];
    const availability: AvailabilityMap = { ...state.availability, [doctorId]: { ...forDoctor, [date]: nextTimes } };

    if (supabase) {
      const db = supabase;
      setState((s) => ({ ...s, availability, saveError: null }));
      void db
        .from("vet_availability")
        .upsert({ id: "default", data: availability, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) setState((s) => ({ ...s, saveError: CLOUD_ERROR_MESSAGE }));
        });
      return;
    }
    persistAvailability(availability);
  };

  const toggleWebVetActive = () => {
    const webVetActive = !state.webVetActive;
    if (supabase) {
      const db = supabase;
      setState((s) => ({ ...s, webVetActive }));
      void db.from("vet_settings").upsert({ id: "webVetActive", value: webVetActive });
      return;
    }
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
      invoiceNumber: "INV-" + id,
      invoiceSent: false,
      createdAt: Date.now(),
    };

    if (supabase) {
      const db = supabase;
      setState((s) => ({ ...s, bookings: [booking, ...s.bookings], saveError: null }));
      const { chatMessages: _chatMessages, clientDocuments: _clientDocuments, doctorDocuments: _doctorDocuments, ...core } = booking;
      void db
        .from("vet_bookings")
        .insert({ id, data: core, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) setState((s) => ({ ...s, saveError: CLOUD_ERROR_MESSAGE }));
        });
    } else {
      const ok = persistBookings([booking, ...state.bookings]);
      if (!ok) return null;
    }

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
    addDocument(bookingId, "doctor", { name: `Consult_Recording_${bookingId}.mp4`, url: "", kind: "video" });
    if (booking) logActivity("Call", `Recording saved for the consult with ${booking.ownerName}`);
  };

  const sendMessage = (bookingId: string, from: ChatMessage["from"], text: string): boolean => {
    if (!text.trim()) return false;
    const ts = Date.now();
    const time = chatTime(ts);

    if (supabase) {
      const db = supabase;
      setState((s) => ({
        ...s,
        bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, chatMessages: [...b.chatMessages, { from, text, time, ts }] } : b)),
        saveError: null,
      }));
      void db
        .from("vet_chat_messages")
        .insert({ booking_id: bookingId, from, text, ts })
        .then(({ error }) => {
          if (error) setState((s) => ({ ...s, saveError: CLOUD_ERROR_MESSAGE }));
        });
      return true;
    }

    return updateBooking(bookingId, (b) => ({ chatMessages: [...b.chatMessages, { from, text, time, ts }] }));
  };

  const addClientDocument = (bookingId: string, doc: { name: string; url: string; kind: SharedDoc["kind"] }): boolean => {
    return addDocument(bookingId, "client", doc);
  };

  const addDoctorDocument = (bookingId: string, doc: { name: string; url: string; kind: SharedDoc["kind"] }): boolean => {
    return addDocument(bookingId, "doctor", doc);
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
