import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius } from "../theme/colors";
import { CATEGORIES } from "../theme/categories";
import { BRANDS, FASHION_WEAR, GROOMING_ACCESSORIES, PET_ACCESSORIES, PET_FOOD, PET_TOYS, PUPPIES, SERVICES, TODAYS_DEALS } from "../lib/mock-catalog";
import CategoryCircle from "../components/CategoryCircle";
import BrandCircle from "../components/BrandCircle";
import ProductCard from "../components/ProductCard";
import PuppyCard from "../components/PuppyCard";
import ServiceCard from "../components/ServiceCard";
import SectionHeader from "../components/SectionHeader";
import TwoColGrid from "../components/TwoColGrid";
import PlaceholderBox from "../components/PlaceholderBox";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Image source={require("../../assets/brand/cph-logo.jpeg")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.tagline}>One Roof Solution to Your Pet Care</Text>
        </View>
        <View style={styles.topBarActions}>
          <Pressable style={styles.iconButton}>
            <Text style={styles.iconText}>🔔</Text>
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Text style={styles.iconText}>👤</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput placeholder="Search products, services & more" placeholderTextColor={colors.textMuted} style={styles.searchInput} />
        </View>

        <View style={styles.hero}>
          <PlaceholderBox label="cover photo — shop & clinic" height={210} radius={14} />
          <View style={styles.heroTextWrap} pointerEvents="none">
            <Text style={styles.heroTitle}>Everything Your Pet Needs, All in One Place</Text>
            <Text style={styles.heroSubtitle}>Shop · Vet Consult · Adoption · Grooming</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <CategoryCircle key={cat.name} category={cat} />
          ))}
        </ScrollView>

        <SectionHeader title="Available Puppies" onSeeAll={() => {}} />
        <TwoColGrid items={PUPPIES} keyExtractor={(p) => p.id} renderItem={(p) => <PuppyCard puppy={p} />} />

        <SectionHeader title="Our Services" />
        <TwoColGrid items={SERVICES} keyExtractor={(s) => s.id} renderItem={(s) => <ServiceCard service={s} />} />

        <View style={styles.bannerWrap}>
          <PlaceholderBox label="Hot Sales Banner" height={80} radius={12} />
        </View>

        <SectionHeader title="Today's Deals" onSeeAll={() => {}} />
        {TODAYS_DEALS.length > 0 ? (
          <TwoColGrid items={TODAYS_DEALS} keyExtractor={(p) => p.id} renderItem={(p) => <ProductCard product={p} />} />
        ) : (
          <View style={styles.emptyDealsCard}>
            <Text style={styles.emptyDealsText}>No deals running — check back soon.</Text>
          </View>
        )}

        <SectionHeader title="Pet Food" />
        <TwoColGrid items={PET_FOOD} keyExtractor={(p) => p.id} renderItem={(p) => <ProductCard product={p} />} />

        <SectionHeader title="Pet Accessories" />
        <TwoColGrid items={PET_ACCESSORIES} keyExtractor={(p) => p.id} renderItem={(p) => <ProductCard product={p} />} />

        <SectionHeader title="Fashion Wear" />
        <TwoColGrid items={FASHION_WEAR} keyExtractor={(p) => p.id} renderItem={(p) => <ProductCard product={p} />} />

        <SectionHeader title="Toys for Your Pet" />
        <TwoColGrid items={PET_TOYS} keyExtractor={(p) => p.id} renderItem={(p) => <ProductCard product={p} />} />

        <View style={styles.deliveryBannerWrap}>
          <PlaceholderBox label="delivery banner" height={70} radius={12} />
          <View style={styles.deliveryTextPill} pointerEvents="none">
            <Text style={styles.deliveryText}>Free delivery inside Kathmandu Valley on orders over Rs. 2,000</Text>
          </View>
        </View>

        <SectionHeader title="Shop by Brand" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandRowScroll}>
          {BRANDS.map((b) => (
            <BrandCircle key={b.id} brand={b} />
          ))}
        </ScrollView>

        <SectionHeader title="Grooming Accessories" />
        <TwoColGrid items={GROOMING_ACCESSORIES} keyExtractor={(p) => p.id} renderItem={(p) => <ProductCard product={p} />} />

        <View style={styles.groomingBannerWrap}>
          <PlaceholderBox label="big banner — dog grooming services" height={120} radius={12} />
          <View style={styles.groomingOverlay} pointerEvents="box-none">
            <View style={styles.groomingTextPill}>
              <Text style={styles.groomingText}>Professional grooming, right at our clinic</Text>
            </View>
            <Pressable style={styles.bookNowButton}>
              <Text style={styles.bookNowText}>Book Now</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.vaccinationCard}>
          <Text style={styles.vaccinationTitle}>Happy Pet Owner</Text>
          <Text style={styles.vaccinationSubtitle}>Download Vaccination Record App</Text>
          <View style={styles.storeRow}>
            <View style={styles.storeBadge}>
              <Text style={styles.storeIcon}>📱</Text>
              <View>
                <Text style={styles.storeBadgeSmall}>Available on the</Text>
                <Text style={styles.storeBadgeBig}>App Store</Text>
              </View>
            </View>
            <View style={styles.storeBadge}>
              <Text style={styles.storeIcon}>▶</Text>
              <View>
                <Text style={styles.storeBadgeSmall}>ANDROID APP ON</Text>
                <Text style={styles.storeBadgeBig}>Google Play</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: colors.background,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  logo: { width: 28, height: 28, borderRadius: 8 },
  tagline: { fontSize: 12, color: colors.textSecondary, flexShrink: 1 },
  topBarActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 14 },
  content: { paddingBottom: 24 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 40,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  searchIcon: { fontSize: 13 },
  searchInput: { flex: 1, fontSize: 13, color: colors.text },
  hero: { marginHorizontal: 16, marginVertical: 10, borderRadius: 14, overflow: "hidden" },
  heroTextWrap: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 12, alignItems: "center" },
  heroTitle: { fontWeight: "700", fontSize: 13, lineHeight: 17, textAlign: "center", color: colors.white, marginBottom: 3 },
  heroSubtitle: { fontSize: 10, textAlign: "center", color: colors.white },
  categoryRow: { paddingHorizontal: 16, gap: 14, paddingBottom: 10 },
  bannerWrap: { marginHorizontal: 16, marginVertical: 6 },
  emptyDealsCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    alignItems: "center",
  },
  emptyDealsText: { fontSize: 11, color: colors.textMuted, textAlign: "center" },
  deliveryBannerWrap: { marginHorizontal: 16, marginBottom: 20, alignItems: "center", justifyContent: "center" },
  deliveryTextPill: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: "80%",
  },
  deliveryText: { fontSize: 12, fontWeight: "600", color: colors.primary, textAlign: "center" },
  brandRowScroll: { paddingHorizontal: 16, gap: 16, paddingBottom: 20 },
  groomingBannerWrap: { marginHorizontal: 16, marginBottom: 20 },
  groomingOverlay: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", gap: 8 },
  groomingTextPill: { backgroundColor: "rgba(255,255,255,0.85)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
  groomingText: { fontSize: 12, fontWeight: "600", color: "#1F7A4D" },
  bookNowButton: { backgroundColor: "#1F7A4D", paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 },
  bookNowText: { color: colors.white, fontSize: 12, fontWeight: "600" },
  vaccinationCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#F0F1F2",
    alignItems: "center",
    gap: 12,
  },
  vaccinationTitle: { fontWeight: "700", fontSize: 15, color: "#1F7A4D", textAlign: "center" },
  vaccinationSubtitle: { fontWeight: "700", fontSize: 13, color: colors.text, textAlign: "center" },
  storeRow: { flexDirection: "row", gap: 10 },
  storeBadge: { backgroundColor: "#000", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 6 },
  storeIcon: { fontSize: 16, color: colors.white },
  storeBadgeSmall: { fontSize: 8, color: colors.white, lineHeight: 10 },
  storeBadgeBig: { fontSize: 11, fontWeight: "700", color: colors.white, lineHeight: 14 },
});
