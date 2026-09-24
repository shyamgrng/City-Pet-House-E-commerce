import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import AppHeader from "../components/AppHeader";
import VetLandingView from "./vet/VetLandingView";
import VetBookView from "./vet/VetBookView";
import VetPaymentView from "./vet/VetPaymentView";
import VetStatusView from "./vet/VetStatusView";
import { VET_DOCTORS, type VetDoctor } from "../lib/vet-catalog";
import type { VetBooking } from "../lib/vet-booking-types";

type Step = { name: "landing" } | { name: "book"; doctor: VetDoctor } | { name: "payment"; booking: VetBooking } | { name: "status"; booking: VetBooking };

export default function VetScreen() {
  const [step, setStep] = useState<Step>({ name: "landing" });

  if (step.name === "status") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppHeader />
        <VetStatusView booking={step.booking} onDone={() => setStep({ name: "landing" })} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader />
      {step.name === "landing" && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.landingSpacer} />
          <VetLandingView onBook={(doctor) => setStep({ name: "book", doctor })} />
        </ScrollView>
      )}
      {step.name === "book" && (
        <VetBookView
          doctor={step.doctor}
          onBack={() => setStep({ name: "landing" })}
          onContinue={(booking) => setStep({ name: "payment", booking })}
        />
      )}
      {step.name === "payment" && (
        <VetPaymentView
          booking={step.booking}
          onBack={() => {
            const doctor = VET_DOCTORS.find((d) => d.id === step.booking.doctorId) ?? VET_DOCTORS[0];
            setStep({ name: "book", doctor });
          }}
          onSubmit={(paymentMethod, fonepayVerified) =>
            setStep({ name: "status", booking: { ...step.booking, paymentMethod, fonepayVerified, status: "Payment Review" } })
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  landingSpacer: { height: 4 },
});
