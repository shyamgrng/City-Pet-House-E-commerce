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
        <PlaceholderBox label="puppy photo" height={84} />
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{puppy.status}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {puppy.breed}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{puppy.price}</Text>
          <Pressable onPress={() => setWishlisted((w) => !w)} hitSlop={8}>
            <Text style={[styles.heart, wishlisted && styles.heartActive]}>♥</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, overflow: "hidden" },
  imageWrap: { position: "relative" },
  statusBadge: { position: "absolute", top: 6, left: 6, backgroundColor: colors.success, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  statusText: { color: colors.white, fontSize: 9, fontWeight: "600" },
  info: { padding: 10 },
  name: { fontSize: 12, fontWeight: "600", color: colors.text },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  price: { fontSize: 12, fontWeight: "700", color: colors.primary },
  heart: { fontSize: 15, color: colors.border },
  heartActive: { color: colors.error },
});
