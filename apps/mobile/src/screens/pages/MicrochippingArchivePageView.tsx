import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "../../theme/colors";
import { MICROCHIP_RECORDS, microchipAddress, type MicrochipRecord } from "../../lib/static-content";
import { useSiteContent } from "../../lib/site-content";

export default function MicrochippingArchivePageView() {
  const records = useSiteContent("cph_microchip_records", MICROCHIP_RECORDS);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<MicrochipRecord | null>(null);

  const lookup = () => {
    const found = records.find((r) => r.mcNumber === query.trim());
    setResult(found ?? null);
    setSubmitted(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBanner}>
        <Text style={styles.headerTitle}>Microchipping Archive</Text>
        <Text style={styles.headerSubtitle}>Look up a registered pet by microchip number.</Text>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.searchTitle}>Search by Chip Number</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="15-digit chip number"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          style={styles.input}
        />
        <Pressable onPress={lookup} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
        {submitted && !result && <Text style={styles.notFoundText}>No record found for that chip number.</Text>}
      </View>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>PET</Text>
          <Text style={styles.resultPetName}>
            {result.petName} — {result.breed}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.resultLabel}>OWNER</Text>
          <Text style={styles.resultOwnerName}>{result.ownerName}</Text>
          <Text style={styles.resultLine}>📞 {result.phone}</Text>
          <Text style={styles.resultLine}>📍 {microchipAddress(result)}</Text>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoHeading}>Not Microchipped Yet?</Text>
        <Text style={styles.infoBody}>
          Book a microchipping appointment through Our Services — it's a quick, permanent way to reunite you with your pet if they're ever
          lost. Registering online after your pet is chipped isn't available in this app yet; visit the clinic or contact us to register.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  headerBanner: { backgroundColor: "#146A8C", borderRadius: 16, padding: 20, marginBottom: 18 },
  headerTitle: { fontWeight: "700", fontSize: 20, color: colors.white, marginBottom: 6 },
  headerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.85)" },
  searchCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 18, marginBottom: 20 },
  searchTitle: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 12 },
  input: { height: 42, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, fontSize: 13, color: colors.text, marginBottom: 10 },
  searchButton: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 11, alignItems: "center" },
  searchButtonText: { color: colors.white, fontSize: 13, fontWeight: "700" },
  notFoundText: { fontSize: 12, color: colors.error, marginTop: 10 },
  resultCard: { borderWidth: 1, borderColor: "#CFE6F1", backgroundColor: "#EAF4F9", borderRadius: 12, padding: 18, marginBottom: 20 },
  resultLabel: { fontSize: 10, fontWeight: "700", color: "#146A8C", letterSpacing: 0.5, marginBottom: 4 },
  resultPetName: { fontSize: 15, fontWeight: "700", color: colors.text },
  divider: { height: 1, backgroundColor: "#CFE6F1", marginVertical: 14 },
  resultOwnerName: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 6 },
  resultLine: { fontSize: 12, color: "#3A4652", marginTop: 2 },
  infoSection: {},
  infoHeading: { fontWeight: "700", fontSize: 15, color: colors.text, marginBottom: 8 },
  infoBody: { fontSize: 12, color: "#5B6773", lineHeight: 18 },
});
