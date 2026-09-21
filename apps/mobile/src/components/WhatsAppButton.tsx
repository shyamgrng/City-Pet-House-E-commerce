import { FontAwesome } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet } from "react-native";

const PHONE_DIGITS = "9779851313717";
const MESSAGE = "Hi City Pet House! I'd like to ask about...";
const WHATSAPP_URL = `https://wa.me/${PHONE_DIGITS}?text=${encodeURIComponent(MESSAGE)}`;

/** Persistent floating chat button, matching the website's WhatsAppButton -- rendered once
 * above the tab navigator in App.tsx so it stays visible across every screen. */
export default function WhatsAppButton() {
  return (
    <Pressable
      onPress={() => Linking.openURL(WHATSAPP_URL)}
      style={styles.button}
      accessibilityLabel="Chat with City Pet House on WhatsApp"
    >
      <FontAwesome name="whatsapp" size={30} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 16,
    bottom: 78,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#25D366",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
});
