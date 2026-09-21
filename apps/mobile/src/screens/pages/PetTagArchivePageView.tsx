import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "../../theme/colors";
import PlaceholderBox from "../../components/PlaceholderBox";
import { PET_TAG_RECORDS, type PetTagRecord } from "../../lib/static-content";

export default function PetTagArchivePageView() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<PetTagRecord | null>(null);

  const lookup = () => {
    const found = PET_TAG_RECORDS.find((r) => r.tagId.toLowerCase() === query.trim().toLowerCase());
    setResult(found ?? null);
    setSubmitted(true);
  };

  if (result) {
    return (
      <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
        <View style={styles.resultBanner}>
          <Text style={styles.resultBannerText}>🐾 PET DETAILS</Text>
        </View>

        <View style={styles.petCard}>
          <View style={styles.petPhoto}>
            <PlaceholderBox label="🐾" fill round />
          </View>
          <Text style={styles.petName}>{result.petName}</Text>
          <Text style={styles.petMeta}>
            {result.breed} · {result.color} · {result.sex}, {result.age}
          </Text>
          {result.microchip && (
            <View style={styles.microchipPill}>
              <Text style={styles.microchipPillText}>Microchip: {result.microchip}</Text>
            </View>
          )}
        </View>

        <View style={styles.ownerCard}>
          <Text style={styles.ownerLabel}>OWNER CONTACT</Text>
          <Text style={styles.ownerName}>{result.ownerName}</Text>
          <Pressable onPress={() => Linking.openURL(`tel:${result.phone}`)} style={styles.phoneRow}>
            <Text style={styles.phoneIcon}>📞</Text>
            <View>
              <Text style={styles.phoneNumber}>{result.phone}</Text>
              <Text style={styles.phoneHint}>Click to call</Text>
            </View>
          </Pressable>
          {result.address && (
            <View style={styles.addressRow}>
              <Text style={styles.addressIcon}>📍</Text>
              <Text style={styles.addressText}>{result.address}</Text>
            </View>
          )}
        </View>

        {result.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>📝 NOTES FOR CARE</Text>
            <Text style={styles.notesText}>{result.notes}</Text>
          </View>
        )}

        <Text style={styles.footerNote}>
          Tag {result.tagId} · Registered with City Pet House · Scanned {result.scans} times
        </Text>

        <Pressable
          onPress={() => {
            setResult(null);
            setSubmitted(false);
            setQuery("");
          }}
          style={styles.newSearchButton}
        >
          <Text style={styles.newSearchButtonText}>Search Another Tag</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBanner}>
        <Text style={styles.headerTitle}>Pet Tag Archive</Text>
        <Text style={styles.headerSubtitle}>Scanned a City Pet House QR tag? Look up the pet and owner details here.</Text>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.searchTitle}>Search This Archive</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Enter tag code (e.g. CPH-1042)"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          style={styles.input}
        />
        <Pressable onPress={lookup} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
        {submitted && !result && <Text style={styles.notFoundText}>No pet found matching that tag code.</Text>}
        <Text style={styles.searchCaption}>Every City Pet House pet tag has a unique code printed on the back — enter it above to see the pet's details and reach the owner.</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoHeading}>How Pet Tags Work</Text>
        <Text style={styles.infoBody}>
          Each tag has a unique QR code linked to your pet's profile — name, breed, and your contact details. If your pet gets lost, whoever
          finds them can scan the tag (or search the code here) to reach you immediately, without needing your phone number visible on the tag
          itself.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  headerBanner: { backgroundColor: colors.primary, borderRadius: 16, padding: 20, marginBottom: 18 },
  headerTitle: { fontWeight: "700", fontSize: 20, color: colors.white, marginBottom: 6 },
  headerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 17 },
  searchCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 18, marginBottom: 20 },
  searchTitle: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 12 },
  input: { height: 42, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, fontSize: 13, color: colors.text, marginBottom: 10 },
  searchButton: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 11, alignItems: "center", marginBottom: 10 },
  searchButtonText: { color: colors.white, fontSize: 13, fontWeight: "700" },
  notFoundText: { fontSize: 12, color: colors.error, marginBottom: 8 },
  searchCaption: { fontSize: 11, color: colors.textMuted, lineHeight: 16 },
  infoSection: { marginBottom: 8 },
  infoHeading: { fontWeight: "700", fontSize: 16, color: colors.text, marginBottom: 8 },
  infoBody: { fontSize: 13, color: "#3A4652", lineHeight: 19 },
  resultContent: { paddingBottom: 32 },
  resultBanner: { backgroundColor: colors.primary, padding: 28, alignItems: "center" },
  resultBannerText: { color: "rgba(255,255,255,0.9)", fontWeight: "700", fontSize: 14, letterSpacing: 1 },
  petCard: { backgroundColor: colors.white, marginHorizontal: 16, marginTop: -30, borderRadius: 16, padding: 24, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  petPhoto: { width: 90, height: 90, marginTop: -60, marginBottom: 10, borderRadius: 45, borderWidth: 4, borderColor: colors.white, overflow: "hidden" },
  petName: { fontWeight: "700", fontSize: 19, color: colors.text },
  petMeta: { fontSize: 12, color: colors.textMuted, marginTop: 4, textAlign: "center" },
  microchipPill: { backgroundColor: "#F0F2F4", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginTop: 10 },
  microchipPillText: { fontSize: 11, color: "#5B6773" },
  ownerCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 20, marginHorizontal: 16, marginTop: 16 },
  ownerLabel: { fontSize: 11, fontWeight: "700", color: colors.primary, letterSpacing: 0.5, marginBottom: 10 },
  ownerName: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 12 },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#EAF6EE", borderRadius: 12, padding: 14 },
  phoneIcon: { fontSize: 18 },
  phoneNumber: { fontSize: 14, fontWeight: "700", color: colors.text },
  phoneHint: { fontSize: 11, color: "#5B8F6B" },
  addressRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  addressIcon: { fontSize: 16 },
  addressText: { flex: 1, fontSize: 13, color: "#3A4652", lineHeight: 18 },
  notesCard: { backgroundColor: "#FFF8EA", borderWidth: 1, borderColor: "#F0DFAE", borderRadius: 16, padding: 18, marginHorizontal: 16, marginTop: 16 },
  notesLabel: { fontSize: 11, fontWeight: "700", color: "#6B5D2E", marginBottom: 6 },
  notesText: { fontSize: 13, color: "#6B5D2E", lineHeight: 18 },
  footerNote: { textAlign: "center", fontSize: 11, color: "#B0B8BF", marginTop: 16 },
  newSearchButton: { marginHorizontal: 16, marginTop: 20, backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 12, alignItems: "center" },
  newSearchButtonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
});
