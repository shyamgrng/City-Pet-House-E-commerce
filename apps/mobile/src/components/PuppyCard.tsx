import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme/colors";
import PlaceholderBox from "./PlaceholderBox";
import type { MockPuppy } from "../lib/mock-catalog";

export default function PuppyCard({ puppy }: { puppy: MockPuppy }) {
  const [wishlisted, setWishlisted] = useState(false);
  return (
    <Pressable style={styles.card}>
      <View style={styles.imageWrap}>
        <PlaceholderBox label={puppy.breed} fill />
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Available</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{puppy.breed}</Text>
        <Text style={styles.meta}>
          {puppy.sex} · {puppy.age}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{puppy.price}</Text>
          <Pressable onPress={() => setWishlisted((w) => !w)} hitSlop={8}>
            <Text style={[styles.heart, wishlisted && styles.heartActive]}>{wishlisted ? "♥" : "♡"}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.card, overflow: "hidden" },
  imageWrap: { position: "relative", width: "100%", aspectRatio: 1 },
  statusBadge: { position: "absolute", top: 6, left: 6, backgroundColor: "#1F7A4D", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { color: colors.white, fontSize: 9, fontWeight: "600" },
  info: { paddingTop: 10 },
  name: { fontSize: 12, fontWeight: "600", color: colors.text, lineHeight: 16 },
  meta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  price: { fontSize: 13, fontWeight: "700", color: colors.primary },
  heart: { fontSize: 15, color: "#C7CDD2" },
  heartActive: { color: colors.error },
});
