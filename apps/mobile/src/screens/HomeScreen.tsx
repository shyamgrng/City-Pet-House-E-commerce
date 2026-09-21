import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { CATEGORIES } from "../theme/categories";
import {
  BLOG_POSTS,
  BRANDS,
  FASHION_WEAR,
  GROOMING_ACCESSORIES,
  PET_ACCESSORIES,
  PET_FOOD,
  PET_TOYS,
  PUPPIES,
  TESTIMONIALS,
  TODAYS_DEALS,
} from "../lib/mock-catalog";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import CircleCard from "../components/CircleCard";
import ProductCard from "../components/ProductCard";
import PuppyCard from "../components/PuppyCard";
import SectionHeader from "../components/SectionHeader";
import TwoColGrid from "../components/TwoColGrid";
import PlaceholderBox from "../components/PlaceholderBox";
import PromoBanner from "../components/PromoBanner";

const HERO_HEADLINE = "Pet products, puppies, adoption & vet care";
const HERO_SUBTEXT = "Order online, pay by receipt upload — shop, puppies, adoption or vet consults.";
const HOT_SALE_BANNER_TEXT = "Hot Sale — up to 30% off this week only";
const MICROCHIP_BANNER_TEXT = "Dog & Cat Microchipping — quick, permanent ID for your pet.";
const DELIVERY_BANNER_TEXT = "Delivery available across Kathmandu Valley — Kathmandu · Lalitpur · Bhaktapur";
const GROOMING_BANNER_TEXT = "Professional dog grooming — book your slot today";

function EmptyRailNotice({ text }: { text: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <PlaceholderBox label="cover photo — shop & clinic" height={165} radius={12} />
          <View style={styles.heroTextWrap} pointerEvents="none">
            <Text style={styles.heroTitle}>{HERO_HEADLINE}</Text>
            <Text style={styles.heroSubtitle}>{HERO_SUBTEXT}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <CircleCard key={cat.name} name={cat.name} size={86} />
          ))}
        </ScrollView>

        <SectionHeader title="Available Puppies" onSeeAll={() => {}} />
        <TwoColGrid items={PUPPIES} keyExtractor={(p) => p.id} renderItem={(p) => <PuppyCard puppy={p} />} />

        <PromoBanner
          label="banner — pet microchipping"
          height={170}
          variant="button-left"
          text={MICROCHIP_BANNER_TEXT}
          buttonLabel="Book Now"
        />

        <PromoBanner label="banner" height={120} variant="pill-center" text={HOT_SALE_BANNER_TEXT} />

        <SectionHeader title="Today's Deals" onSeeAll={() => {}} />
        {TODAYS_DEALS.length > 0 ? (
          <TwoColGrid items={TODAYS_DEALS} keyExtractor={(p) => p.id} renderItem={(p) => <ProductCard product={p} />} />
        ) : (
          <EmptyRailNotice text={'No deals running right now — tick "Today\'s Deal" on a product in Admin → Shop to feature it here.'} />
        )}

        <SectionHeader title="Pet Food" onSeeAll={() => {}} />
        <TwoColGrid items={PET_FOOD} keyExtractor={(p) => p.id} renderItem={(p) => <ProductCard product={p} />} />

        <SectionHeader title="Pet Accessories" onSeeAll={() => {}} />
        <TwoColGrid items={PET_ACCESSORIES} keyExtractor={(p) => p.id} renderItem={(p) => <ProductCard product={p} />} />

        <SectionHeader title="Fashion Wear" onSeeAll={() => {}} />
        <TwoColGrid items={FASHION_WEAR} keyExtractor={(p) => p.id} renderItem={(p) => <ProductCard product={p} />} />

        <SectionHeader title="Toys for Your Pet" onSeeAll={() => {}} />
        <TwoColGrid items={PET_TOYS} keyExtractor={(p) => p.id} renderItem={(p) => <ProductCard product={p} />} />

        <PromoBanner label="delivery banner" height={110} variant="pill-center" text={DELIVERY_BANNER_TEXT} />

        <SectionHeader title="Shop by Brand" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandRow}>
          {BRANDS.map((b) => (
            <CircleCard key={b.id} name={b.name} size={88} />
          ))}
        </ScrollView>

        <SectionHeader title="Grooming Accessories" onSeeAll={() => {}} />
        <TwoColGrid items={GROOMING_ACCESSORIES} keyExtractor={(p) => p.id} renderItem={(p) => <ProductCard product={p} />} />

        <PromoBanner
          label="big banner — dog grooming services"
          height={220}
          variant="button-left"
          text={GROOMING_BANNER_TEXT}
          buttonLabel="Book Now"
          buttonColor="#1F7A4D"
        />

        <SectionHeader title="Our Happy Customers" />
        <View style={styles.testimonialList}>
          {TESTIMONIALS.map((t) => (
            <View key={t.id} style={styles.testimonialCard}>
              <Text style={styles.testimonialQuote}>&quot;{t.quote}&quot;</Text>
              <Text style={styles.testimonialName}>{t.name}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Latest from the Blog" />
        <View style={styles.blogList}>
          {BLOG_POSTS.map((post) => (
            <Pressable key={post.id} style={styles.blogCard}>
              <PlaceholderBox label="blog photo" height={100} />
              <View style={styles.blogInfo}>
                <Text style={styles.blogDate}>{post.date}</Text>
                <Text style={styles.blogTitle} numberOfLines={2}>
                  {post.title}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <AppFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 24 },
  hero: { marginHorizontal: 16, marginBottom: 10, marginTop: 2 },
  heroTextWrap: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 12, alignItems: "center" },
  heroTitle: { fontWeight: "700", fontSize: 13, lineHeight: 17, textAlign: "center", color: colors.white, marginBottom: 3 },
  heroSubtitle: { fontSize: 11, textAlign: "center", color: colors.white, lineHeight: 15 },
  categoryRow: { paddingHorizontal: 16, gap: 14, paddingBottom: 10 },
  emptyCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    alignItems: "center",
  },
  emptyText: { fontSize: 12, color: colors.textMuted, textAlign: "center" },
  brandRow: { paddingHorizontal: 16, gap: 16, paddingBottom: 20 },
  testimonialList: { paddingHorizontal: 16, paddingBottom: 20, gap: 14 },
  testimonialCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 16 },
  testimonialQuote: { fontSize: 12, color: "#3A4652", lineHeight: 18, marginBottom: 10 },
  testimonialName: { fontSize: 12, fontWeight: "600", color: colors.text },
  blogList: { paddingHorizontal: 16, paddingBottom: 24, gap: 14 },
  blogCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, overflow: "hidden" },
  blogInfo: { padding: 12 },
  blogDate: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  blogTitle: { fontSize: 13, fontWeight: "600", color: colors.text, lineHeight: 18 },
});
