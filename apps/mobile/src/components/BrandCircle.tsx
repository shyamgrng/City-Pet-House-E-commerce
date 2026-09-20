import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";
import PlaceholderBox from "./PlaceholderBox";
import type { MockBrand } from "../lib/mock-catalog";

export default function BrandCircle({ brand }: { brand: MockBrand }) {
  return (
    <Pressable style={styles.wrap}>
      <PlaceholderBox label={brand.name} height={60} round />
      <Text style={styles.label} numberOfLines={1}>
        {brand.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 6, minWidth: 64 },
  label: { fontSize: 10, fontWeight: "600", color: colors.text },
});
