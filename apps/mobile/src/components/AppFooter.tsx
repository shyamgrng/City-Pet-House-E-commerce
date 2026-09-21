import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

/** Matches the mobile-visible part of the website's SiteFooter exactly (the link columns and
 * "Happy Shopping" card are desktop-only there, so this only needs the social row, the
 * vaccination-app card, and the copyright line). */
export default function AppFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.socialRow}>
        <View style={[styles.socialIcon, { backgroundColor: "#1877F2" }]}>
          <Text style={styles.socialLetter}>f</Text>
        </View>
        <View style={[styles.socialIcon, { backgroundColor: "#C13584" }]}>
          <Text style={styles.socialEmoji}>📷</Text>
        </View>
        <View style={[styles.socialIcon, { backgroundColor: "#000000" }]}>
          <Text style={styles.socialEmoji}>🎵</Text>
        </View>
        <View style={[styles.socialIcon, { backgroundColor: "#FF0000" }]}>
          <Text style={styles.socialTriangle}>▶</Text>
        </View>
      </View>

      <View style={styles.vaccinationCard}>
        <Text style={styles.vaccinationTitle}>Happy Pet Owner</Text>
        <Text style={styles.vaccinationSubtitle}>Download Vaccination Record App</Text>
        <View style={styles.storeRow}>
          <Pressable style={styles.storeBadge}>
            <Text style={styles.storeIcon}>📱</Text>
            <View>
              <Text style={styles.storeBadgeSmall}>Available on the</Text>
              <Text style={styles.storeBadgeBig}>App Store</Text>
            </View>
          </Pressable>
          <Pressable style={styles.storeBadge}>
            <Text style={styles.storeIcon}>▶</Text>
            <View>
              <Text style={styles.storeBadgeSmall}>ANDROID APP ON</Text>
              <Text style={styles.storeBadgeBig}>Google Play</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View style={styles.copyrightWrap}>
        <Text style={styles.copyrightText}>Copyright © 2026 City Pet House & Animal Clinic. All Rights Reserved.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { backgroundColor: "#1A2027", paddingTop: 28, paddingBottom: 24, paddingHorizontal: 16 },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 16, paddingBottom: 22 },
  socialIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  socialLetter: { color: colors.white, fontSize: 18, fontWeight: "700" },
  socialEmoji: { fontSize: 16 },
  socialTriangle: { color: colors.white, fontSize: 14 },
  vaccinationCard: {
    borderRadius: 12,
    backgroundColor: "#F0F8F2",
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },
  vaccinationTitle: { fontWeight: "700", fontSize: 16, color: "#1F7A4D", textAlign: "center" },
  vaccinationSubtitle: { fontWeight: "700", fontSize: 14, color: colors.text, textAlign: "center" },
  storeRow: { flexDirection: "row", gap: 10 },
  storeBadge: { backgroundColor: "#000", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 8 },
  storeIcon: { fontSize: 18, color: colors.white },
  storeBadgeSmall: { fontSize: 9, color: colors.white, lineHeight: 11 },
  storeBadgeBig: { fontSize: 12, fontWeight: "700", color: colors.white, lineHeight: 15 },
  copyrightWrap: { borderTopWidth: 1, borderTopColor: "#3A4652", paddingTop: 16 },
  copyrightText: { fontSize: 11, color: "#8A96A3", textAlign: "center" },
});
