import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import PlaceholderBox from "./PlaceholderBox";

type Variant = "overlay-bottom" | "pill-center" | "button-left";

export default function PromoBanner({
  label,
  height,
  text,
  variant = "overlay-bottom",
  buttonLabel,
  buttonColor = colors.primary,
}: {
  label: string;
  height: number;
  text?: string;
  variant?: Variant;
  buttonLabel?: string;
  buttonColor?: string;
}) {
  return (
    <View style={styles.wrap}>
      <PlaceholderBox label={label} height={height} radius={12} />
      {text && variant === "pill-center" && (
        <View style={styles.pillCenter} pointerEvents="none">
          <Text style={styles.pillText}>{text}</Text>
        </View>
      )}
      {(text || buttonLabel) && variant === "button-left" && (
        <View style={styles.buttonLeftOverlay} pointerEvents="box-none">
          {text && <Text style={styles.overlayHeadline}>{text}</Text>}
          {buttonLabel && (
            <Pressable style={[styles.button, { backgroundColor: buttonColor }]}>
              <Text style={styles.buttonText}>{buttonLabel}</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginBottom: 20, position: "relative" },
  pillCenter: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    textAlign: "center",
    overflow: "hidden",
  },
  buttonLeftOverlay: { position: "absolute", inset: 0, justifyContent: "center", paddingHorizontal: 16, gap: 10 },
  overlayHeadline: { color: colors.white, fontSize: 15, fontWeight: "700" },
  button: { alignSelf: "flex-start", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9 },
  buttonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
});
