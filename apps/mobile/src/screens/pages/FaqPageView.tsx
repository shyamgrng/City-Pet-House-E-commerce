import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../theme/colors";
import { FAQ_CONTENT } from "../../lib/static-content";
import { useSiteContent } from "../../lib/site-content";

export default function FaqPageView() {
  const content = useSiteContent("cph_faq_content", FAQ_CONTENT);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = useMemo(() => ["All", ...Array.from(new Set(content.items.map((i) => i.cat)))], [content.items]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return content.items.filter((it) => {
      if (category !== "All" && it.cat !== category) return false;
      if (q && !(it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [content.items, category, search]);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{content.pageTitle}</Text>
      <Text style={styles.subtitle}>{content.pageSubtitle}</Text>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search a question…"
        placeholderTextColor={colors.textMuted}
        style={styles.searchInput}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {categories.map((cat) => (
          <Pressable key={cat} onPress={() => setCategory(cat)} style={[styles.chip, category === cat && styles.chipActive]}>
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No questions match your search.</Text>
        </View>
      ) : (
        filtered.map((fq) => {
          const open = openId === fq.id;
          return (
            <Pressable key={fq.id} onPress={() => setOpenId(open ? null : fq.id)} style={styles.faqCard}>
              <View style={styles.faqHeaderRow}>
                <Text style={styles.faqQuestion}>{fq.q}</Text>
                <Text style={styles.faqToggle}>{open ? "−" : "+"}</Text>
              </View>
              {open && <Text style={styles.faqAnswer}>{fq.a}</Text>}
            </Pressable>
          );
        })
      )}

      <View style={styles.contactCard}>
        <Text style={styles.contactTitle}>{content.contactHeading}</Text>
        <Text style={styles.contactSubtitle}>{content.contactSubtext}</Text>
        <Text style={styles.contactInfo}>
          City Pet House & Animal Clinic{"\n"}info@citypethouse.com.np · +977-9851313717{"\n"}Gokarneshwor Municipality–6, Kathmandu, Nepal
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  title: { fontWeight: "700", fontSize: 20, color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 13, color: "#3A4652", lineHeight: 19, marginBottom: 14 },
  searchInput: { height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingHorizontal: 14, fontSize: 13, color: colors.text, marginBottom: 16, backgroundColor: colors.white },
  chipsRow: { gap: 8, paddingBottom: 18 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: "600", color: "#3A4652" },
  chipTextActive: { color: colors.white },
  emptyCard: { backgroundColor: "#F7F8F9", borderWidth: 1, borderStyle: "dashed", borderColor: colors.border, borderRadius: 10, padding: 20, alignItems: "center" },
  emptyText: { fontSize: 12, color: colors.textMuted },
  faqCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginBottom: 10, overflow: "hidden", padding: 16 },
  faqHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  faqQuestion: { flex: 1, fontSize: 13, fontWeight: "700", color: colors.text },
  faqToggle: { fontSize: 16, fontWeight: "700", color: colors.primary },
  faqAnswer: { fontSize: 12, color: "#3A4652", lineHeight: 18, marginTop: 10 },
  contactCard: { backgroundColor: "#1A2027", borderRadius: 16, padding: 24, alignItems: "center", marginTop: 10 },
  contactTitle: { fontWeight: "700", fontSize: 17, color: colors.white, marginBottom: 6 },
  contactSubtitle: { fontSize: 12, color: "#9BB0BE", marginBottom: 14 },
  contactInfo: { fontSize: 12, color: colors.white, lineHeight: 20, textAlign: "center" },
});
