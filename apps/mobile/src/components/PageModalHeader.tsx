import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export default function PageModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View style={styles.wrap}>
      <Pressable onPress={onClose} style={styles.backButton} hitSlop={8}>
        <Text style={styles.backText}>←</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 18, color: colors.text },
  title: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.text },
  spacer: { width: 30 },
});
