import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme/colors";
import PlaceholderBox from "./PlaceholderBox";
import type { MockProduct } from "../lib/mock-catalog";

export default function ProductCard({ product }: { product: MockProduct }) {
  const [wishlisted, setWishlisted] = useState(false);
  return (
    <Pressable style={styles.card}>
      <View style={styles.imageWrap}>
        <PlaceholderBox label="product photo" height={90} />
        {product.hotSale && (
          <View style={styles.hotSaleBadge}>
            <Text style={styles.hotSaleText}>Hot Sale</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <View>
            {product.originalPrice && <Text style={styles.originalPrice}>{product.originalPrice}</Text>}
            <Text style={[styles.price, product.hotSale && styles.hotPrice]}>{product.price}</Text>
          </View>
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
  hotSaleBadge: { position: "absolute", top: 6, right: 6, backgroundColor: colors.error, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  hotSaleText: { color: colors.white, fontSize: 9, fontWeight: "700" },
  info: { padding: 10 },
  name: { fontSize: 12, fontWeight: "500", color: colors.text },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  originalPrice: { fontSize: 9, color: colors.textMuted, textDecorationLine: "line-through" },
  price: { fontSize: 12, fontWeight: "700", color: colors.primary },
  hotPrice: { color: colors.error },
  heart: { fontSize: 15, color: colors.border },
  heartActive: { color: colors.error },
});
