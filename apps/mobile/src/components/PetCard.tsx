import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme/colors";
import PlaceholderBox from "./PlaceholderBox";
import { useCart } from "../context/CartContext";
import { formatRs } from "../lib/format";
import type { PetMock } from "../lib/pet-catalog";

export default function PetCard({ pet, onPress }: { pet: PetMock; onPress: () => void }) {
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCart();

  const bookNow = () => {
    addItem({ id: pet.id, name: `${pet.breed} (Puppy)`, price: pet.price });
    Alert.alert("Added to cart", `${pet.breed} has been added to your cart.`);
  };

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <PlaceholderBox label={pet.breed} fill />
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Available</Text>
        </View>
        {pet.hasVideo && (
          <View style={styles.videoBadge}>
            <Text style={styles.videoText}>🎥 Video</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.headRow}>
          <Text style={styles.name}>{pet.breed}</Text>
          <Pressable onPress={() => setWishlisted((w) => !w)} hitSlop={8}>
            <Text style={[styles.heart, wishlisted && styles.heartActive]}>{wishlisted ? "♥" : "♡"}</Text>
          </Pressable>
        </View>
        <Text style={styles.meta}>
          {pet.sex} · {pet.age}
        </Text>
        <View style={styles.tagsRow}>
          {pet.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {pet.vaccinationsDone > 0 && (
            <View style={styles.vaccTag}>
              <Text style={styles.vaccTagText}>💉 Vaccinated</Text>
            </View>
          )}
          {pet.dewormingsDone > 0 && (
            <View style={styles.dewormTag}>
              <Text style={styles.dewormTagText}>🪱 Dewormed</Text>
            </View>
          )}
        </View>
        <Text style={styles.price}>{formatRs(pet.price)}</Text>
        <Text style={styles.delivery}>+ {formatRs(pet.deliveryFee)} delivery</Text>
        <Pressable onPress={bookNow} style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.white, borderRadius: radius.card, overflow: "hidden" },
  imageWrap: { position: "relative", width: "100%", aspectRatio: 1 },
  statusBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "#1F7A4D", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  statusText: { color: colors.white, fontSize: 10, fontWeight: "600" },
  videoBadge: { position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  videoText: { color: colors.white, fontSize: 10, fontWeight: "600" },
  info: { padding: 14 },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 6 },
  name: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.text },
  heart: { fontSize: 16, color: "#C7CDD2" },
  heartActive: { color: colors.error },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginVertical: 8 },
  tag: { backgroundColor: "#E6F3EC", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: "600", color: "#1F7A4D" },
  vaccTag: { backgroundColor: "#EAF4F9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  vaccTagText: { fontSize: 10, fontWeight: "600", color: "#146A8C" },
  dewormTag: { backgroundColor: "#FFF8E8", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  dewormTagText: { fontSize: 10, fontWeight: "600", color: "#8A6D1F" },
  price: { fontSize: 16, fontWeight: "800", color: "#0F7CA8", marginBottom: 2 },
  delivery: { fontSize: 11, color: colors.textMuted, marginBottom: 10 },
  bookButton: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 11, alignItems: "center" },
  bookButtonText: { color: colors.white, fontSize: 12, fontWeight: "600" },
});
