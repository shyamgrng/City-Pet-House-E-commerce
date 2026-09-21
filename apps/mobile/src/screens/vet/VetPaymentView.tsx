import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../theme/colors";
import PlaceholderBox from "../../components/PlaceholderBox";
import type { VetBooking } from "../../lib/vet-booking-types";

const PAYMENT_METHODS = ["eSewa", "Khalti", "Bank Transfer"];

export default function VetPaymentView({
  booking,
  onBack,
  onSubmit,
}: {
  booking: VetBooking;
  onBack: () => void;
  onSubmit: (receiptUri: string) => void;
}) {
  const [receiptUri, setReceiptUri] = useState("");
  const [error, setError] = useState("");

  const pickReceipt = async () => {
    setError("");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("We need permission to access your photos to upload the receipt.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const submit = () => {
    if (!receiptUri) {
      setError("Please upload your payment receipt to continue.");
      return;
    }
    onSubmit(receiptUri);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable onPress={onBack}>
        <Text style={styles.backLink}>← Back</Text>
      </Pressable>
      <Text style={styles.title}>Consult Fee Payment</Text>
      <Text style={styles.subtitle}>Pay via any of the QR codes below, then upload your receipt screenshot. Your booking is held pending admin approval.</Text>

      <View style={styles.feeCard}>
        <Text style={styles.feeLabel}>Consultation Fee</Text>
        <Text style={styles.feeAmount}>Rs. {booking.amount}</Text>
        <View style={styles.qrRow}>
          {PAYMENT_METHODS.map((pm) => (
            <View key={pm} style={styles.qrItem}>
              <PlaceholderBox label="QR" height={90} radius={10} />
              <Text style={styles.qrLabel}>{pm}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.uploadLabel}>
        Upload Payment Receipt <Text style={styles.required}>*</Text>
      </Text>
      {receiptUri ? (
        <View style={styles.receiptWrap}>
          <Image source={{ uri: receiptUri }} style={styles.receiptImage} resizeMode="contain" />
          <Pressable onPress={pickReceipt}>
            <Text style={styles.replaceLink}>Replace</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={pickReceipt} style={styles.dropZone}>
          <Text style={styles.dropZoneText}>Tap to upload your payment screenshot</Text>
        </Pressable>
      )}

      {error !== "" && <Text style={styles.error}>{error}</Text>}
      <Pressable onPress={submit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit for Approval</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  backLink: { fontSize: 13, fontWeight: "600", color: colors.primary, marginBottom: 14 },
  title: { fontWeight: "700", fontSize: 20, color: colors.text, textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#5B6773", textAlign: "center", marginBottom: 18, lineHeight: 18 },
  feeCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 18, alignItems: "center", marginBottom: 18 },
  feeLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  feeAmount: { fontWeight: "700", fontSize: 22, color: colors.text, marginBottom: 16 },
  qrRow: { flexDirection: "row", gap: 12 },
  qrItem: { alignItems: "center", gap: 6, width: 90 },
  qrLabel: { fontSize: 11, fontWeight: "600", color: colors.text },
  uploadLabel: { fontSize: 12, fontWeight: "600", color: "#3A4652", marginBottom: 8 },
  required: { color: colors.error },
  receiptWrap: { marginBottom: 16, gap: 8 },
  receiptImage: { width: "100%", height: 220, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  replaceLink: { fontSize: 12, fontWeight: "600", color: colors.primary },
  dropZone: { height: 150, marginBottom: 16, borderRadius: 10, borderWidth: 2, borderStyle: "dashed", borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  dropZoneText: { fontSize: 12, color: colors.textMuted },
  error: { fontSize: 12, color: colors.error, marginBottom: 10 },
  submitButton: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 14, alignItems: "center" },
  submitButtonText: { color: colors.white, fontSize: 14, fontWeight: "600" },
});
