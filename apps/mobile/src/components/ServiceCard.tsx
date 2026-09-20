import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "../theme/colors";
import PlaceholderBox from "./PlaceholderBox";
import type { MockService } from "../lib/mock-catalog";

export default function ServiceCard({ service }: { service: MockService }) {
  return (
    <Pressable style={styles.card}>
      <PlaceholderBox label="service photo" height={70} />
      <Text style={styles.name} numberOfLines={1}>
        {service.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, overflow: "hidden" },
  name: { fontSize: 11, fontWeight: "600", color: colors.text, padding: 10 },
});
