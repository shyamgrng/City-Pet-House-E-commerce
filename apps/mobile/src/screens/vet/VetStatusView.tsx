import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../theme/colors";
import { isBookingActionable } from "../../lib/vet-catalog";
import type { VetBooking, VetStatus } from "../../lib/vet-booking-types";

function useCountUpTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function StatusCard({
  tone,
  icon,
  title,
  children,
}: {
  tone: "green" | "amber" | "red";
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  const toneStyles = { green: styles.cardGreen, amber: styles.cardAmber, red: styles.cardRed }[tone];
  return (
    <View style={[styles.card, toneStyles]}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function VetStatusView({
  booking,
  onDone,
}: {
  booking: VetBooking;
  onDone: () => void;
}) {
  const [status, setStatus] = useState<VetStatus>(booking.status);
  const [callJoined, setCallJoined] = useState(false);
  const [leftCall, setLeftCall] = useState(false);
  const waitingTime = useCountUpTimer();

  // Simulates the real backend's admin-approval -> doctor-reconfirm -> doctor-starts-call
  // pipeline locally, since there's no real backend behind this mobile prototype yet.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (status === "Payment Review") {
      timers.push(setTimeout(() => setStatus(booking.instant ? "Confirmed" : "Awaiting Doctor Reconfirm"), 3000));
    } else if (status === "Awaiting Doctor Reconfirm") {
      timers.push(setTimeout(() => setStatus("Confirmed"), 2500));
    } else if (status === "Confirmed" && isBookingActionable(booking.instant, booking.scheduledAt)) {
      timers.push(setTimeout(() => setStatus("In Progress"), 5000));
    }
    return () => timers.forEach(clearTimeout);
  }, [status, booking.instant, booking.scheduledAt]);

  if (leftCall) {
    return (
      <View style={styles.centeredWrap}>
        <View style={[styles.card, styles.cardGray]}>
          <Text style={styles.cardIcon}>✓</Text>
          <Text style={styles.cardTitle}>Thank You!</Text>
          <Text style={styles.cardBody}>
            Your consult with {booking.doctorName} has ended. Thank you for choosing City Pet House & Animal Clinic — a summary of your consult
            has been emailed to you.
          </Text>
          <Pressable onPress={onDone} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Back to Web Vet</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const inCall = status === "In Progress" && callJoined;

  if (inCall) {
    return (
      <View style={styles.callWrap}>
        <View style={styles.callTop}>
          <Text style={styles.callDoctor}>{booking.doctorName}</Text>
          <Text style={styles.callPet}>
            {booking.petName} · {booking.petSpecies}
          </Text>
        </View>
        <View style={styles.callVideoArea}>
          <Text style={styles.callVideoIcon}>📹</Text>
          <Text style={styles.callVideoText}>Video call would appear here</Text>
        </View>
        <View style={styles.callControls}>
          <View style={styles.callControlButton}>
            <Text style={styles.callControlIcon}>🎙️</Text>
          </View>
          <View style={styles.callControlButton}>
            <Text style={styles.callControlIcon}>📷</Text>
          </View>
          <Pressable onPress={() => setLeftCall(true)} style={styles.leaveButton}>
            <Text style={styles.leaveButtonText}>Leave Call</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (status === "Confirmed" && !isBookingActionable(booking.instant, booking.scheduledAt)) {
    return (
      <View style={styles.centeredWrap}>
        <StatusCard tone="green" icon="✓" title="Consult Confirmed">
          <Text style={styles.cardBody}>
            Your consult with {booking.doctorName} is confirmed for{" "}
            <Text style={styles.strong}>
              {booking.scheduledDate} at {booking.scheduledTime}
            </Text>
            . Invoice {booking.invoiceNumber} has been emailed to you.
          </Text>
          <View style={styles.innerNote}>
            <Text style={styles.innerNoteText}>Come back closer to your appointment — you&apos;ll be able to join the call starting 30 minutes before.</Text>
          </View>
        </StatusCard>
      </View>
    );
  }

  return (
    <View style={styles.centeredWrap}>
      <View style={[styles.card, styles.cardGreen]}>
        <Text style={styles.cardIcon}>✓</Text>
        <Text style={styles.cardTitle}>Payment Approved</Text>
        {status === "Payment Review" ? (
          <View style={styles.innerNote}>
            <Text style={styles.innerNoteText}>Verifying your payment…</Text>
          </View>
        ) : status === "Awaiting Doctor Reconfirm" ? (
          <>
            <Text style={styles.cardBody}>
              Your payment has been verified — we&apos;re confirming your appointment time with {booking.doctorName}. You&apos;ll be notified
              the moment it&apos;s confirmed.
            </Text>
            <View style={styles.innerNote}>
              <Text style={styles.innerNoteText}>Waiting for {booking.doctorName} to reconfirm…</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.cardBody}>
              Your consult with {booking.doctorName} is ready. Invoice {booking.invoiceNumber} has been emailed to you.
            </Text>
            {status === "Confirmed" && (
              <View style={styles.innerNote}>
                <Text style={styles.innerNoteText}>Waiting {waitingTime} — your call will appear here as soon as {booking.doctorName} starts it.</Text>
              </View>
            )}
            {status === "In Progress" && !callJoined && (
              <View style={styles.joinWrap}>
                <Pressable onPress={() => setCallJoined(true)} style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>📹 Join Call</Text>
                </Pressable>
                <Text style={styles.joinHint}>{booking.doctorName} has started the call — join whenever you&apos;re ready.</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredWrap: { padding: 16, paddingTop: 40, paddingBottom: 40 },
  card: { borderRadius: 20, paddingHorizontal: 24, paddingVertical: 32, alignItems: "center" },
  cardGreen: { backgroundColor: "#EAF6EE", borderWidth: 1, borderColor: "#CFE9D8" },
  cardAmber: { backgroundColor: "#FFF8EA", borderWidth: 1, borderColor: "#F0DFAE" },
  cardRed: { backgroundColor: "#FDEDEC", borderWidth: 1, borderColor: "#F3C7C3" },
  cardGray: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cardIcon: { fontSize: 40, marginBottom: 10 },
  cardTitle: { fontWeight: "700", fontSize: 20, color: colors.text, marginBottom: 12, textAlign: "center" },
  cardBody: { fontSize: 14, color: "#3A6B4C", lineHeight: 20, textAlign: "center", marginBottom: 12 },
  strong: { fontWeight: "700" },
  innerNote: { backgroundColor: colors.white, borderWidth: 1, borderColor: "#CFE9D8", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  innerNoteText: { fontSize: 12, fontWeight: "600", color: "#3A6B4C", textAlign: "center" },
  joinWrap: { alignItems: "center", gap: 10 },
  joinButton: { backgroundColor: "#1F7A4D", borderRadius: radius.button, paddingHorizontal: 26, paddingVertical: 14 },
  joinButtonText: { color: colors.white, fontSize: 14, fontWeight: "600" },
  joinHint: { fontSize: 11, color: "#3A6B4C", textAlign: "center" },
  doneButton: { marginTop: 16, backgroundColor: colors.primary, borderRadius: radius.button, paddingHorizontal: 22, paddingVertical: 12 },
  doneButtonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
  callWrap: { flex: 1, backgroundColor: "#1A2027", justifyContent: "space-between" },
  callTop: { padding: 16 },
  callDoctor: { color: colors.white, fontSize: 15, fontWeight: "700" },
  callPet: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 },
  callVideoArea: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  callVideoIcon: { fontSize: 40 },
  callVideoText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  callControls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 },
  callControlButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  callControlIcon: { fontSize: 20 },
  leaveButton: { backgroundColor: colors.error, borderRadius: radius.button, paddingHorizontal: 24, paddingVertical: 14 },
  leaveButtonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
});
