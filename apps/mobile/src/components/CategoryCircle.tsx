import { Pressable, Text, View, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import type { Category } from "../theme/categories";

export default function CategoryCircle({ category, onPress }: { category: Category; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View style={[styles.circle, { backgroundColor: category.bg }]}>
        <Text style={styles.letter}>{category.letter}</Text>
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 6, minWidth: 78 },
  circle: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  letter: { color: colors.white, fontSize: 24, fontWeight: "700" },
  label: { fontSize: 12, color: colors.text, fontWeight: "600" },
});
