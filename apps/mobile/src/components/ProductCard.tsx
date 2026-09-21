import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme/colors";
import PlaceholderBox from "./PlaceholderBox";
import type { MockProduct } from "../lib/mock-catalog";

export default function ProductCard({ product }: { product: MockProduct }) {
  const [wishlisted, setWishlisted] = useState(false);
  const rating = product.rating ?? 0;

  return (
    <Pressable style={styles.card}>
      <View style={styles.imageWrap}>
        <PlaceholderBox label={product.name} fill />
        {product.newArrival && (
          <View style={styles.newBadge}>
            <Text style={styles.badgeText}>New</Text>
          </View>
        )}
        {product.hotSale && (
          <View style={styles.hotSaleBadge}>
            <Text style={styles.badgeText}>Hot Sale</Text>
          </View>
        )}
        {product.outOfStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of stock</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        {rating > 0 && (
          <Text style={styles.rating}>
            {"★".repeat(Math.round(rating))}
            {"☆".repeat(5 - Math.round(rating))} <Text style={styles.ratingNumber}>{rating}</Text>
          </Text>
        )}
        <View style={styles.priceRow}>
          {product.hotSale ? (
            <View>
              <Text style={styles.originalPrice}>{product.originalPrice ?? product.price}</Text>
              <Text style={styles.hotPrice}>{product.price}</Text>
            </View>
          ) : (
            <Text style={styles.price}>{product.price}</Text>
          )}
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
  newBadge: { position: "absolute", top: 6, left: 6, backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  hotSaleBadge: { position: "absolute", top: 6, right: 6, backgroundColor: colors.error, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: "700" },
  outOfStockBadge: { position: "absolute", bottom: 6, left: 6, right: 6, backgroundColor: "rgba(0,0,0,0.7)", paddingVertical: 4, borderRadius: 4 },
  outOfStockText: { color: colors.white, fontSize: 9, fontWeight: "600", textAlign: "center" },
  info: { paddingTop: 10 },
  name: { fontSize: 12, fontWeight: "600", color: colors.text, lineHeight: 16 },
  rating: { fontSize: 10, color: "#C9962B", marginTop: 2 },
  ratingNumber: { color: colors.textMuted },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  originalPrice: { fontSize: 9, color: colors.textMuted, textDecorationLine: "line-through" },
  price: { fontSize: 14, fontWeight: "700", color: colors.primary },
  hotPrice: { fontSize: 14, fontWeight: "700", color: colors.error },
  heart: { fontSize: 15, color: "#C7CDD2" },
  heartActive: { color: colors.error },
});
