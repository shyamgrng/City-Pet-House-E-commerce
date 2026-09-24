import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../theme/colors";
import PaymentMethodPanel from "../../components/PaymentMethodPanel";
import { PAYMENT_METHODS_FALLBACK } from "../../lib/payment-methods";
import { useSiteContent } from "../../lib/site-content";
import type { VetBooking } from "../../lib/vet-booking-types";

export default function VetPaymentView({
  booking,
  onBack,
  onSubmit,
}: {
  booking: VetBooking;
  onBack: () => void;
  onSubmit: (paymentMethod: string, fonepayVerified: boolean) => void;
}) {
  const methods = useSiteContent("cph_payment_methods", PAYMENT_METHODS_FALLBACK);
  const activeMethods = methods.filter((m) => m.active);
  const [selectedMethodKey, setSelectedMethodKey] = useState(activeMethods[0]?.key ?? "");
  const [fonepayVerified, setFonepayVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeMethods.length > 0 && !activeMethods.some((m) => m.key === selectedMethodKey)) {
      setSelectedMethodKey(activeMethods[0].key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMethods]);

  const submit = () => {
    if (!selectedMethodKey) {
      setError("Please choose a payment method.");
      return;
    }
    onSubmit(selectedMethodKey, fonepayVerified);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable onPress={onBack}>
        <Text style={styles.backLink}>← Back</Text>
      </Pressable>
      <Text style={styles.title}>Consult Fee Payment</Text>
      <Text style={styles.subtitle}>Choose how you&apos;d like to pay, then confirm below once you&apos;ve sent the payment. Your booking is held pending admin approval.</Text>

      <View style={styles.feeCard}>
        <PaymentMethodPanel
          methods={activeMethods}
          amount={booking.amount}
          reference={`vet-${booking.invoiceNumber}`}
          remarks1="City Pet House"
          remarks2="Vet Consult"
          selectedKey={selectedMethodKey}
          onSelect={setSelectedMethodKey}
          onFonepayVerifiedChange={setFonepayVerified}
        />
      </View>

      {error !== "" && <Text style={styles.error}>{error}</Text>}
      <Pressable onPress={submit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>I&apos;ve Paid — Submit for Approval</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  backLink: { fontSize: 13, fontWeight: "600", color: colors.primary, marginBottom: 14 },
  title: { fontWeight: "700", fontSize: 20, color: colors.text, textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#5B6773", textAlign: "center", marginBottom: 18, lineHeight: 18 },
  feeCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 18, marginBottom: 18 },
  error: { fontSize: 12, color: colors.error, marginBottom: 10, textAlign: "center" },
  submitButton: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 14, alignItems: "center" },
  submitButtonText: { color: colors.white, fontSize: 14, fontWeight: "600" },
});
