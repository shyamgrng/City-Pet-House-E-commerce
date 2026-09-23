import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { HOW_TO_BUY_CONTENT } from "../../lib/static-content";
import { useSiteContent } from "../../lib/site-content";

export default function HowToBuyPageView() {
  const content = useSiteContent("cph_how_to_buy", HOW_TO_BUY_CONTENT);
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>How to Buy from City Pet House</Text>
      <Text style={styles.intro}>{content.intro}</Text>

      {content.steps.map((step, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={styles.stepIconCol}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepIconText}>{step.icon}</Text>
            </View>
            {i < content.steps.length - 1 && <View style={styles.stepLine} />}
          </View>
          <View style={styles.stepBody}>
            <Text style={styles.stepLabel}>STEP {i + 1}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDesc}>{step.desc}</Text>
            {step.items.length > 0 && (
              <View style={styles.itemList}>
                {step.items.map((it, ii) => (
                  <Text key={ii} style={styles.itemText}>
                    • {it}
                  </Text>
                ))}
              </View>
            )}
            {step.note && (
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>⚠ {step.note}</Text>
              </View>
            )}
            {step.benefits && (
              <View style={styles.benefitBox}>
                <Text style={styles.benefitText}>✓ {step.benefits}</Text>
              </View>
            )}
          </View>
        </View>
      ))}

      <View style={styles.contactCard}>
        <Text style={styles.contactTitle}>Need Help With Your Order?</Text>
        <Text style={styles.contactSubtitle}>Our team is ready to assist you.</Text>
        <Text style={styles.contactInfo}>City Pet House & Animal Clinic{"\n"}info@citypethouse.com.np · +977-9851313717</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  title: { fontWeight: "700", fontSize: 20, color: colors.text, marginBottom: 10 },
  intro: { fontSize: 13, color: "#3A4652", lineHeight: 19, marginBottom: 20 },
  stepRow: { flexDirection: "row", gap: 14 },
  stepIconCol: { alignItems: "center" },
  stepIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  stepIconText: { fontSize: 18 },
  stepLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 6, minHeight: 20 },
  stepBody: { flex: 1, paddingBottom: 24 },
  stepLabel: { fontSize: 10, fontWeight: "700", color: colors.primary, marginBottom: 4 },
  stepTitle: { fontWeight: "700", fontSize: 15, color: colors.text, marginBottom: 6 },
  stepDesc: { fontSize: 12, color: "#3A4652", lineHeight: 18, marginBottom: 8 },
  itemList: { gap: 3, marginBottom: 8 },
  itemText: { fontSize: 12, color: "#3A4652", lineHeight: 18 },
  noteBox: { backgroundColor: "#FDF6E9", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  noteText: { fontSize: 11, color: "#C9962B" },
  benefitBox: { backgroundColor: "#E9F5EE", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  benefitText: { fontSize: 11, color: "#1F7A4D" },
  contactCard: { backgroundColor: "#1A2027", borderRadius: 16, padding: 24, alignItems: "center", marginTop: 4 },
  contactTitle: { fontWeight: "700", fontSize: 17, color: colors.white, marginBottom: 6 },
  contactSubtitle: { fontSize: 12, color: "#9BB0BE", marginBottom: 14 },
  contactInfo: { fontSize: 12, color: colors.white, lineHeight: 20, textAlign: "center" },
});
