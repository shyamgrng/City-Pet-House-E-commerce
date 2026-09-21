import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../theme/colors";
import PlaceholderBox from "../../components/PlaceholderBox";
import { VET_DOCTORS, type VetDoctor } from "../../lib/vet-catalog";

export default function VetLandingView({ onBook }: { onBook: (doctor: VetDoctor) => void }) {
  return (
    <View>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Talk to a Certified Vet</Text>
        <Text style={styles.bannerText}>
          Book a doctor online now, or schedule a video consult in advance — pick a doctor and a time that works for you.
        </Text>
        <Pressable style={styles.bannerButton} onPress={() => onBook(VET_DOCTORS[0])}>
          <Text style={styles.bannerButtonText}>Book Now</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Our Doctors</Text>
      <View style={styles.doctorList}>
        {VET_DOCTORS.map((doc) => (
          <View key={doc.id} style={styles.doctorCard}>
            <View style={styles.doctorPhotoWrap}>
              <PlaceholderBox label="doctor photo" fill />
              <View style={styles.onlineBadge}>
                <View style={[styles.onlineDot, { backgroundColor: doc.online ? "#1F7A4D" : "#8A96A3" }]} />
                <Text style={styles.onlineText}>{doc.online ? "Online" : "Offline"}</Text>
              </View>
            </View>
            <View style={styles.doctorInfo}>
              <View style={styles.doctorNameRow}>
                <Text style={styles.doctorName}>{doc.name}</Text>
                {doc.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Verified</Text>
                  </View>
                )}
              </View>
              <Text style={styles.doctorQualification}>{doc.qualification}</Text>
              <Text style={styles.doctorNvc}>NVC No: {doc.nvcNumber}</Text>
              <Pressable style={styles.doctorBookButton} onPress={() => onBook(doc)}>
                <Text style={styles.doctorBookButtonText}>Book Now</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { margin: 16, padding: 20, borderRadius: 16, backgroundColor: "#EAF4F9" },
  bannerTitle: { fontWeight: "700", fontSize: 18, color: colors.text, marginBottom: 6 },
  bannerText: { fontSize: 13, color: "#3A4652", lineHeight: 18, marginBottom: 14 },
  bannerButton: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 12, alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 22 },
  bannerButtonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontWeight: "700", fontSize: 15, color: colors.text, marginHorizontal: 16, marginBottom: 12 },
  doctorList: { paddingHorizontal: 16, gap: 14, paddingBottom: 8 },
  doctorCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: "hidden" },
  doctorPhotoWrap: { position: "relative", width: "100%", height: 160 },
  onlineBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineText: { fontSize: 9, fontWeight: "600", color: colors.text },
  doctorInfo: { padding: 12 },
  doctorNameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  doctorName: { flex: 1, fontSize: 13, fontWeight: "700", color: colors.text },
  verifiedBadge: { backgroundColor: "#EAF6EE", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  verifiedText: { fontSize: 9, fontWeight: "700", color: "#1F7A4D" },
  doctorQualification: { fontSize: 11, color: "#5B6773", marginTop: 4, marginBottom: 2 },
  doctorNvc: { fontSize: 10, color: colors.textMuted, marginBottom: 10 },
  doctorBookButton: { backgroundColor: colors.primary, borderRadius: 6, paddingVertical: 9, alignItems: "center" },
  doctorBookButtonText: { color: colors.white, fontSize: 12, fontWeight: "600" },
});
