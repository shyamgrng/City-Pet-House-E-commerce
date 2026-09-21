import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "../../theme/colors";

export default function AdminLoginPageView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>Staff / Admin Login</Text>
        <Text style={styles.subtitle}>This sign-in is for City Pet House staff and admin only — not for customers.</Text>

        <Text style={styles.fieldLabel}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@citypethouse.com.np"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={styles.fieldLabel}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
        />

        <Pressable
          onPress={() =>
            Alert.alert(
              "Not available yet",
              "Staff/admin sign-in isn't wired up in the mobile app yet — tap \"Admin ↗\" above to sign in on the website instead."
            )
          }
          style={styles.signInButton}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, justifyContent: "center" },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 24, alignItems: "center" },
  icon: { fontSize: 32, marginBottom: 10 },
  title: { fontWeight: "700", fontSize: 17, color: colors.text, marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 12, color: colors.textMuted, textAlign: "center", lineHeight: 17, marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#3A4652", marginBottom: 6, alignSelf: "flex-start" },
  input: { width: "100%", height: 42, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, fontSize: 13, color: colors.text, marginBottom: 14 },
  signInButton: { width: "100%", backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 13, alignItems: "center", marginTop: 6 },
  signInButtonText: { color: colors.white, fontSize: 14, fontWeight: "600" },
});
