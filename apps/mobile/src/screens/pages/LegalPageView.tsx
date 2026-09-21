import { ScrollView, StyleSheet, Text } from "react-native";
import { colors } from "../../theme/colors";

export default function LegalPageView({ title, body }: { title: string; body: string }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  title: { fontWeight: "700", fontSize: 20, color: colors.text, marginBottom: 16 },
  body: { fontSize: 13, color: "#3A4652", lineHeight: 21 },
});
