import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius } from "../theme/colors";
import AppHeader from "../components/AppHeader";
import PetCard from "../components/PetCard";
import PuppyCard from "../components/PuppyCard";
import TwoColGrid from "../components/TwoColGrid";
import PlaceholderBox from "../components/PlaceholderBox";
import { useCart } from "../context/CartContext";
import { formatRs } from "../lib/format";
import { DEWORM_STAGES_COUNT, PETS, SPECIES_CHIPS, VACCINE_STAGES_COUNT, otherAnimalsLabel, type PetMock } from "../lib/pet-catalog";

export default function PetsScreen() {
  const [species, setSpecies] = useState("All");
  const [selected, setSelected] = useState<PetMock | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCart();

  const filtered = species === "All" ? PETS : PETS.filter((p) => p.species === species);

  const selectPet = (p: PetMock) => {
    setSelected(p);
    setActivePhoto(0);
    setWishlisted(false);
  };

  const bookNow = (pet: PetMock) => {
    addItem({ id: pet.id, name: `${pet.breed} (Puppy)`, price: pet.price });
    Alert.alert("Added to cart", `${pet.breed} has been added to your cart.`);
  };

  if (selected) {
    const similar = PETS.filter((p) => p.species === selected.species && p.id !== selected.id).slice(0, 6);
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppHeader />
        <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => setSelected(null)}>
            <Text style={styles.backLink}>← Back to Pets Available</Text>
          </Pressable>

          <View style={styles.heroWrap}>
            <PlaceholderBox label={`${selected.breed} — photo ${activePhoto + 1} of ${selected.photoCount}`} height={260} radius={12} />
            <View style={styles.heroStatusBadge}>
              <Text style={styles.heroStatusText}>Available</Text>
            </View>
          </View>

          {selected.photoCount > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
              {Array.from({ length: selected.photoCount }).map((_, i) => (
                <Pressable key={i} onPress={() => setActivePhoto(i)} style={[styles.thumb, activePhoto === i && styles.thumbActive]}>
                  <PlaceholderBox label={`${i + 1}`} fill />
                </Pressable>
              ))}
            </ScrollView>
          )}

          <View style={styles.detailHeadRow}>
            <Text style={styles.detailName}>{selected.breed}</Text>
            <Pressable onPress={() => setWishlisted((w) => !w)} hitSlop={8}>
              <Text style={[styles.detailHeart, wishlisted && styles.detailHeartActive]}>{wishlisted ? "♥" : "♡"}</Text>
            </Pressable>
          </View>
          <Text style={styles.detailMeta}>
            {selected.sex} · {selected.age}
          </Text>

          <View style={styles.tagsRow}>
            {selected.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          {(selected.vaccinationsDone > 0 || selected.dewormingsDone > 0) && (
            <View style={styles.tagsRow}>
              {selected.vaccinationsDone > 0 && (
                <View style={styles.vaccTag}>
                  <Text style={styles.vaccTagText}>
                    💉 Vaccinated {selected.vaccinationsDone}/{VACCINE_STAGES_COUNT} doses
                  </Text>
                </View>
              )}
              {selected.dewormingsDone > 0 && (
                <View style={styles.dewormTag}>
                  <Text style={styles.dewormTagText}>
                    🪱 Dewormed {selected.dewormingsDone}/{DEWORM_STAGES_COUNT} doses
                  </Text>
                </View>
              )}
            </View>
          )}

          <Text style={styles.detailPrice}>{formatRs(selected.price)}</Text>
          <Text style={styles.detailDelivery}>+ {formatRs(selected.deliveryFee)} delivery</Text>
          <Pressable onPress={() => bookNow(selected)} style={styles.detailBookButton}>
            <Text style={styles.detailBookButtonText}>Book Now</Text>
          </Pressable>

          {similar.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.similarTitle}>{otherAnimalsLabel(selected.species)}</Text>
              <TwoColGrid
                items={similar}
                keyExtractor={(p) => p.id}
                renderItem={(p) => (
                  <PuppyCard puppy={{ id: p.id, breed: p.breed, sex: p.sex, age: p.age, price: formatRs(p.price) }} />
                )}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Pets Available for Sale</Text>
        <Text style={styles.subtitle}>Verified, healthy puppies ready to bring home.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {SPECIES_CHIPS.map((c) => (
            <Pressable key={c} onPress={() => setSpecies(c)} style={[styles.chip, species === c && styles.chipActive]}>
              <Text style={[styles.chipText, species === c && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No pets available in this category right now.</Text>
          </View>
        ) : (
          <TwoColGrid items={filtered} keyExtractor={(p) => p.id} renderItem={(p) => <PetCard pet={p} onPress={() => selectPet(p)} />} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 24 },
  detailContent: { paddingHorizontal: 16, paddingBottom: 24 },
  title: { fontWeight: "700", fontSize: 20, color: colors.text, marginHorizontal: 16, marginTop: 14 },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginHorizontal: 16, marginTop: 4, marginBottom: 16 },
  chipsRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: "#F0F2F4" },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  chipTextActive: { color: colors.white },
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
  backLink: { fontSize: 13, fontWeight: "600", color: colors.primary, marginTop: 14, marginBottom: 14 },
  heroWrap: { position: "relative", marginBottom: 10 },
  heroStatusBadge: { position: "absolute", top: 10, left: 10, backgroundColor: "#1F7A4D", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  heroStatusText: { color: colors.white, fontSize: 10, fontWeight: "600" },
  thumbRow: { gap: 8, paddingBottom: 14 },
  thumb: { width: 64, height: 64, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  thumbActive: { borderColor: colors.primary, borderWidth: 2 },
  detailHeadRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  detailName: { flex: 1, fontSize: 22, fontWeight: "700", color: colors.text },
  detailHeart: { fontSize: 20, color: "#C7CDD2" },
  detailHeartActive: { color: colors.error },
  detailMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  tag: { backgroundColor: "#E6F3EC", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: "600", color: "#1F7A4D" },
  vaccTag: { backgroundColor: "#EAF4F9", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 },
  vaccTagText: { fontSize: 11, fontWeight: "600", color: "#146A8C" },
  dewormTag: { backgroundColor: "#FFF8E8", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 },
  dewormTagText: { fontSize: 11, fontWeight: "600", color: "#8A6D1F" },
  detailPrice: { fontSize: 22, fontWeight: "800", color: "#0F7CA8", marginTop: 14 },
  detailDelivery: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 18 },
  detailBookButton: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 13, paddingHorizontal: 24, alignItems: "center", alignSelf: "flex-start", marginBottom: 28 },
  detailBookButtonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
  similarSection: { marginHorizontal: -16 },
  similarTitle: { fontWeight: "700", fontSize: 15, color: colors.text, marginHorizontal: 16, marginBottom: 12 },
});
