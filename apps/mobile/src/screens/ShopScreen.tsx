import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius } from "../theme/colors";
import AppHeader from "../components/AppHeader";
import FilterSection, { FilterRow } from "../components/FilterSection";
import FilterChip from "../components/FilterChip";
import ProductCard from "../components/ProductCard";
import TwoColGrid from "../components/TwoColGrid";
import { formatRs } from "../lib/format";
import { SHOP_BRANDS, SHOP_CATEGORIES, SHOP_PRODUCTS, salePrice, type ShopProduct } from "../lib/shop-catalog";

const RATING_OPTIONS = [5, 4, 3, 2];
const PRICE_RANGE_OPTIONS: { label: string; min: number; max: number }[] = [
  { label: "Under Rs. 500", min: 0, max: 500 },
  { label: "Rs. 500 – 1,500", min: 500, max: 1500 },
  { label: "Rs. 1,500 – 5,000", min: 1500, max: 5000 },
  { label: "Rs. 5,000+", min: 5000, max: Infinity },
];

function aiSearch(products: ShopProduct[], query: string): string[] {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!tokens.length) return [];
  return products
    .map((p) => {
      const haystack = `${p.name} ${p.category} ${p.brand}`.toLowerCase();
      const score = tokens.reduce((acc, t) => (haystack.includes(t) ? acc + 1 : acc), 0);
      return { name: p.name, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.name);
}

function toCardProduct(p: ShopProduct) {
  return {
    id: p.id,
    name: p.name,
    price: formatRs(salePrice(p)),
    originalPrice: p.hotSale ? formatRs(p.price) : undefined,
    hotSale: p.hotSale,
    newArrival: p.newArrival,
    outOfStock: p.outOfStock,
    rating: p.rating,
  };
}

export default function ShopScreen() {
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [rating, setRating] = useState(0);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [aiResultNames, setAiResultNames] = useState<string[] | null>(null);

  const clearAi = () => {
    setAiResultNames(null);
    setAiNote("");
  };

  const filtered = useMemo(() => {
    if (aiResultNames) {
      const set = new Set(aiResultNames);
      return SHOP_PRODUCTS.filter((p) => set.has(p.name));
    }
    return SHOP_PRODUCTS.filter((p) => {
      if (brand && p.brand !== brand) return false;
      if (category && p.category !== category) return false;
      if (rating > 0 && p.rating < rating) return false;
      if (priceRange && !(p.price >= priceRange.min && p.price < priceRange.max)) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!`${p.name} ${p.category} ${p.brand}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [brand, category, rating, priceRange, search, aiResultNames]);

  const runAskAi = () => {
    const q = search.trim();
    if (!q) return;
    setAiBusy(true);
    setAiNote("");
    setTimeout(() => {
      const names = aiSearch(SHOP_PRODUCTS, q);
      setAiResultNames(names);
      setAiBusy(false);
      setAiNote(names.length ? `✨ AI found ${names.length} match${names.length === 1 ? "" : "es"} for "${q}"` : `✨ AI found no matches for "${q}"`);
    }, 400);
  };

  const hasActiveFilters = !aiNote && (brand || category || rating > 0 || priceRange);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Shop</Text>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            value={search}
            onChangeText={(t) => {
              setSearch(t);
              if (aiResultNames) clearAi();
            }}
            placeholder="Search products…"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          <Pressable onPress={runAskAi} style={styles.aiButton}>
            <Text style={styles.aiButtonText}>✨ {aiBusy ? "Thinking…" : "Ask AI"}</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => setFiltersOpen((v) => !v)} style={styles.filtersToggle}>
          <Text style={styles.filtersToggleText}>Filters</Text>
          <Text style={styles.filtersToggleIcon}>{filtersOpen ? "▲" : "▼"}</Text>
        </Pressable>

        {filtersOpen && (
          <View style={styles.filtersPanel}>
            <FilterSection title="Categories">
              {SHOP_CATEGORIES.map((c) => (
                <FilterRow key={c} label={c} active={category === c} onPress={() => setCategory(category === c ? "" : c)} />
              ))}
            </FilterSection>

            <FilterSection title="Brand">
              {SHOP_BRANDS.map((b) => (
                <FilterRow key={b} label={b} active={brand === b} onPress={() => setBrand(brand === b ? "" : b)} />
              ))}
            </FilterSection>

            <FilterSection title="Rating">
              {RATING_OPTIONS.map((n) => (
                <FilterRow
                  key={n}
                  label={`${"★".repeat(n)}${"☆".repeat(5 - n)} ${n} & up`}
                  active={rating === n}
                  onPress={() => setRating(rating === n ? 0 : n)}
                />
              ))}
            </FilterSection>

            <FilterSection title="Price">
              {PRICE_RANGE_OPTIONS.map((pr) => (
                <FilterRow
                  key={pr.label}
                  label={pr.label}
                  active={priceRange?.min === pr.min}
                  onPress={() => setPriceRange(priceRange?.min === pr.min ? null : { min: pr.min, max: pr.max })}
                />
              ))}
            </FilterSection>
          </View>
        )}

        {aiNote && (
          <View style={styles.aiNoteRow}>
            <Text style={styles.aiNoteText}>{aiNote}</Text>
            <Pressable onPress={clearAi}>
              <Text style={styles.aiNoteClear}>Clear ✕</Text>
            </Pressable>
          </View>
        )}

        {hasActiveFilters && (
          <View style={styles.chipsRow}>
            {brand && <FilterChip label="Filtered by brand:" value={brand} onClear={() => setBrand("")} />}
            {category && <FilterChip label="Filtered by category:" value={category} onClear={() => setCategory("")} />}
            {rating > 0 && <FilterChip label="Filtered by rating:" value={`${rating} & up`} onClear={() => setRating(0)} />}
            {priceRange && (
              <FilterChip
                label="Filtered by price:"
                value={PRICE_RANGE_OPTIONS.find((pr) => pr.min === priceRange.min)?.label ?? ""}
                onClear={() => setPriceRange(null)}
              />
            )}
          </View>
        )}

        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No products match these filters.</Text>
          </View>
        ) : (
          <TwoColGrid items={filtered} keyExtractor={(p) => p.id} renderItem={(p) => <ProductCard product={toCardProduct(p)} />} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 24 },
  titleRow: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  title: { fontWeight: "700", fontSize: 20, color: colors.text },
  searchRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  searchInput: {
    flex: 1,
    height: 36,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    fontSize: 12,
    color: colors.text,
  },
  aiButton: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.button,
    backgroundColor: colors.aiAccent,
    alignItems: "center",
    justifyContent: "center",
  },
  aiButtonText: { color: colors.white, fontSize: 12, fontWeight: "600" },
  filtersToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtersToggleText: { fontSize: 13, fontWeight: "600", color: colors.text },
  filtersToggleIcon: { fontSize: 11, color: colors.text },
  filtersPanel: { paddingHorizontal: 16, marginBottom: 8 },
  aiNoteRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  aiNoteText: { fontSize: 11, color: colors.aiAccent, flexShrink: 1 },
  aiNoteClear: { fontSize: 11, color: colors.error, fontWeight: "600" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, marginBottom: 6 },
  emptyCard: {
    marginHorizontal: 16,
    padding: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    alignItems: "center",
  },
  emptyText: { fontSize: 12, color: colors.textMuted },
});
