import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export default function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

export function FilterRow({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={[styles.rowText, active && styles.rowTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 18 },
  title: { fontWeight: "700", fontSize: 14, color: colors.text, marginBottom: 10 },
  row: { paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#F0F2F4" },
  rowText: { fontSize: 13, color: "#3A4652" },
  rowTextActive: { fontWeight: "700", color: colors.primary },
});
