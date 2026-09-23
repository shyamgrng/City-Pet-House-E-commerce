import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../theme/colors";
import PlaceholderBox from "../../components/PlaceholderBox";
import { SERVICES } from "../../lib/static-content";
import { useSiteContent } from "../../lib/site-content";

export default function ServicesPageView() {
  const services = useSiteContent("cph_services", SERVICES);
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Our Services</Text>
      <Text style={styles.subtitle}>Complete pet care under one roof — from routine checkups to emergency treatment.</Text>

      <View style={styles.list}>
        {services.map((svc) => (
          <View key={svc.id} style={styles.card}>
            <PlaceholderBox label="service photo" height={150} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{svc.name}</Text>
              <Text style={styles.cardDesc}>{svc.desc}</Text>
              <Pressable style={styles.bookButton}>
                <Text style={styles.bookButtonText}>Book Now</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  title: { fontWeight: "700", fontSize: 20, color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 18 },
  list: { gap: 16 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: "hidden" },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 6 },
  cardDesc: { fontSize: 13, color: "#5B6773", lineHeight: 18, marginBottom: 12 },
  bookButton: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 10, alignItems: "center" },
  bookButtonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
});
