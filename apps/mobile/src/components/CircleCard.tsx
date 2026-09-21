import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";
import PlaceholderBox from "./PlaceholderBox";

/** A circular placeholder photo + caption below — used for both pet categories and brands,
 * matching the web app's MediaSlot(shape="circle") + caption pattern exactly. */
export default function CircleCard({ name, size = 86, onPress }: { name: string; size?: number; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.wrap, { minWidth: size }]}>
      <PlaceholderBox label={name} height={size} round />
      <Text style={styles.label} numberOfLines={1}>
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 6 },
  label: { fontSize: 12, fontWeight: "600", color: colors.text },
});
