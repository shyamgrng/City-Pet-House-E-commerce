import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export default function FilterChip({ label, value, onClear }: { label: string; value: string; onClear: () => void }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{value}</Text>
      </View>
      <Pressable onPress={onClear} hitSlop={6}>
        <Text style={styles.clear}>Clear ✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 6, marginRight: 10, marginBottom: 8 },
  label: { fontSize: 11, color: colors.textSecondary },
  pill: { backgroundColor: "#EAF4F9", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 11, fontWeight: "600", color: colors.primary },
  clear: { fontSize: 11, color: colors.error },
});
