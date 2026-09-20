import { Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius } from "../theme/colors";
import { CATEGORIES } from "../theme/categories";
import CategoryCircle from "../components/CategoryCircle";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={require("../../assets/brand/cph-logo.jpeg")} style={styles.logo} resizeMode="contain" />
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput placeholder="Search products, services & more" placeholderTextColor={colors.textMuted} style={styles.searchInput} />
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Everything your pet needs</Text>
          <Text style={styles.heroSubtitle}>Shop, adopt, and book a vet — all in one place</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Shop by Pet</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <CategoryCircle key={cat.name} category={cat} />
          ))}
        </ScrollView>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's Deals</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>
        <View style={styles.emptyDealsCard}>
          <Text style={styles.emptyDealsText}>No deals running — check back soon.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 24 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 10, backgroundColor: colors.white },
  logo: { width: 120, height: 36, alignSelf: "flex-start" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: { fontSize: 13 },
  searchInput: { flex: 1, fontSize: 13, color: colors.text },
  hero: {
    margin: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: radius.card,
    backgroundColor: colors.primary,
  },
  heroTitle: { fontFamily: "System", fontWeight: "700", fontSize: 19, color: colors.white, marginBottom: 4 },
  heroSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.9)" },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sectionTitle: { fontWeight: "700", fontSize: 15, color: colors.text },
  seeAll: { fontSize: 12, color: colors.primary, fontWeight: "600" },
  categoryRow: { paddingHorizontal: 16, gap: 16 },
  emptyDealsCard: {
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    alignItems: "center",
  },
  emptyDealsText: { fontSize: 12, color: colors.textMuted, textAlign: "center" },
});
