import { StyleSheet, Text, View } from "react-native";

/**
 * Stand-in for real photography (product/pet/banner images aren't sourced yet) --
 * mirrors the web app's ImagePlaceholder component exactly (same colors/icon/label layout)
 * so the two surfaces look identical until real photos are uploaded.
 */
export default function PlaceholderBox({
  label,
  height,
  radius = 0,
  round = false,
  fill = false,
}: {
  label: string;
  /** Fixed pixel height -- ignored when `fill` is set. */
  height?: number;
  radius?: number;
  round?: boolean;
  /** Fills the parent instead of a fixed height -- pair with a wrapper that sets
   * `aspectRatio: 1` so the box scales with its own rendered width, matching the
   * website's `aspect-square` product/pet card photos exactly across screen sizes. */
  fill?: boolean;
}) {
  return (
    <View
      style={[
        styles.box,
        fill
          ? styles.fill
          : { height, width: round ? height : "100%", borderRadius: round ? (height ?? 0) / 2 : radius },
      ]}
    >
      <Text style={styles.icon}>🖼</Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#E4E7EA",
    borderWidth: 1,
    borderColor: "#D7DBDF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    gap: 4,
  },
  fill: { position: "absolute", inset: 0 },
  icon: { fontSize: 16, opacity: 0.7, color: "#7A8592" },
  label: { fontSize: 10, color: "#7A8592", textAlign: "center" },
});
