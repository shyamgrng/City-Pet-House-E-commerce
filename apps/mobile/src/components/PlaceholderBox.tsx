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
  icon: { fontSize: 16, opacity: 0.7, color: "#7A8592" },
  label: { fontSize: 10, color: "#7A8592", textAlign: "center" },
});
