import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

export default function PetsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.center}>
        <Text style={styles.title}>Pets Available</Text>
        <Text style={styles.subtitle}>Pet listings + adoption coming next.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  title: { fontWeight: "700", fontSize: 18, color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted },
});
