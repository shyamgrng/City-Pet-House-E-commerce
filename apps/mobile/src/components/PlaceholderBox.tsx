import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

/**
 * Stand-in for real photography (product/pet/banner images aren't sourced yet).
 * Mirrors the design prototype's <image-slot> placeholder concept.
 */
export default function PlaceholderBox({
  label,
  height,
  radius = 0,
  round = false,
}: {
  label: string;
  height: number;
  radius?: number;
  round?: boolean;
}) {
  return (
    <View
      style={[
        styles.box,
        { height, width: round ? height : "100%", borderRadius: round ? height / 2 : radius },
      ]}
    >
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#E4E9EC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  label: { fontSize: 10, color: colors.textMuted, textAlign: "center" },
});
