import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "../../theme/colors";
import { computeScheduledAt, next7Days, TIME_SLOTS, type VetDoctor } from "../../lib/vet-catalog";
import type { VetBooking } from "../../lib/vet-booking-types";

const DATE_OPTIONS = next7Days();

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

export default function VetBookView({
  doctor,
  onBack,
  onContinue,
}: {
  doctor: VetDoctor;
  onBack: () => void;
  onContinue: (booking: VetBooking) => void;
}) {
  const [date, setDate] = useState(DATE_OPTIONS[0]);
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState("");
  const [petAge, setPetAge] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!ownerName.trim() || !ownerPhone.trim() || !ownerEmail.trim() || !petName.trim() || !petSpecies.trim() || !petAge.trim() || !reason.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/^\d{10}$/.test(ownerPhone.replace(/\D/g, ""))) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail.trim())) {
      setError("Enter a valid email like abc@abc.com.");
      return;
    }
    onContinue({
      doctorId: doctor.id,
      doctorName: doctor.name,
      instant: doctor.online,
      scheduledDate: doctor.online ? "" : date,
      scheduledTime: doctor.online ? "" : time,
      scheduledAt: doctor.online ? null : computeScheduledAt(date, time),
      amount: doctor.feeRs,
      ownerName,
      ownerPhone,
      ownerEmail,
      petName,
      petSpecies,
      petAge,
      reason,
      status: "Payment Review",
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable onPress={onBack}>
        <Text style={styles.backLink}>← Back to Web Vet</Text>
      </Pressable>
      <Text style={styles.title}>Book a Vet Consult</Text>
      <Text style={styles.doctorLine}>
        Doctor: <Text style={styles.doctorNameStrong}>{doctor.name}</Text>
      </Text>

      {doctor.online ? (
        <View style={styles.onlineNotice}>
          <Text style={styles.onlineNoticeText}>This doctor is online now — your consult starts as soon as payment is approved.</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionLabel}>Preferred Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {DATE_OPTIONS.map((d) => (
              <Pressable key={d} onPress={() => setDate(d)} style={[styles.chip, date === d && styles.chipActive]}>
                <Text style={[styles.chipText, date === d && styles.chipTextActive]}>{d}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Text style={styles.sectionLabel}>Preferred Time</Text>
          <View style={styles.chipRowWrap}>
            {TIME_SLOTS.map((t) => (
              <Pressable key={t} onPress={() => setTime(t)} style={[styles.chip, time === t && styles.chipActive]}>
                <Text style={[styles.chipText, time === t && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={styles.groupTitle}>Owner Details</Text>
      <Field label="Full Name" value={ownerName} onChangeText={setOwnerName} placeholder="Your full name" />
      <Field label="Phone" value={ownerPhone} onChangeText={setOwnerPhone} placeholder="98XXXXXXXX" keyboardType="phone-pad" />
      <Field label="Email" value={ownerEmail} onChangeText={setOwnerEmail} placeholder="you@example.com" keyboardType="email-address" />

      <Text style={styles.groupTitle}>Pet Details</Text>
      <Field label="Pet Name" value={petName} onChangeText={setPetName} placeholder="e.g. Bruno" />
      <Field label="Species & Breed" value={petSpecies} onChangeText={setPetSpecies} placeholder="e.g. Dog — Labrador" />
      <Field label="Pet Age" value={petAge} onChangeText={setPetAge} placeholder="e.g. 2 yrs" />
      <Field label="Reason for Visit" value={reason} onChangeText={setReason} placeholder="Symptoms, checkup type, etc." />

      {error !== "" && <Text style={styles.error}>{error}</Text>}
      <Pressable onPress={submit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Continue to Payment</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  backLink: { fontSize: 13, fontWeight: "600", color: colors.primary, marginBottom: 14 },
  title: { fontWeight: "700", fontSize: 20, color: colors.text, marginBottom: 4 },
  doctorLine: { fontSize: 13, color: "#5B6773", marginBottom: 18 },
  doctorNameStrong: { fontWeight: "700", color: colors.text },
  onlineNotice: { backgroundColor: "#EAF6EE", borderRadius: radius.button, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 18 },
  onlineNoticeText: { fontSize: 13, fontWeight: "600", color: "#1F7A4D" },
  sectionLabel: { fontSize: 12, fontWeight: "600", color: "#3A4652", marginBottom: 8 },
  chipRow: { gap: 8, paddingBottom: 16 },
  chipRowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#F0F2F4" },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: "600", color: "#3A4652" },
  chipTextActive: { color: colors.white },
  groupTitle: { fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 6, marginBottom: 12 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#3A4652", marginBottom: 6 },
  required: { color: colors.error },
  input: { height: 42, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, fontSize: 13, color: colors.text, backgroundColor: colors.white },
  error: { fontSize: 12, color: colors.error, marginBottom: 10 },
  submitButton: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 14, alignItems: "center", marginTop: 6 },
  submitButtonText: { color: colors.white, fontSize: 14, fontWeight: "600" },
});
