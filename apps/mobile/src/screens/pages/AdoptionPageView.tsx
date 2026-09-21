import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "../../theme/colors";
import PlaceholderBox from "../../components/PlaceholderBox";
import { ADOPTION_POSTS } from "../../lib/static-content";

function FormField({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted} style={styles.input} />
    </View>
  );
}

export default function AdoptionPageView() {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"Male" | "Female">("Male");
  const [contact, setContact] = useState("");
  const [desc, setDesc] = useState("");
  const [posted, setPosted] = useState(false);

  const canSave = name.trim().length > 0 && breed.trim().length > 0 && /^\d{10}$/.test(contact.replace(/\D/g, ""));

  const submit = () => {
    if (!canSave) return;
    setName("");
    setBreed("");
    setAge("");
    setContact("");
    setDesc("");
    setPosted(true);
    setTimeout(() => setPosted(false), 3000);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Help a Dog Find a Home</Text>
        <Text style={styles.bannerText}>Post an adoption notice for free — your listing stays live for 15 days and can be extended on request.</Text>
      </View>

      <Text style={styles.sectionTitle}>Dogs Looking for a Home</Text>
      <View style={styles.postsList}>
        {ADOPTION_POSTS.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postImageWrap}>
              <PlaceholderBox label={post.breed} fill />
              <View style={styles.forAdoptionBadge}>
                <Text style={styles.forAdoptionText}>For Adoption</Text>
              </View>
            </View>
            <View style={styles.postBody}>
              <Text style={styles.postName}>
                {post.name} · {post.breed}
              </Text>
              <Text style={styles.postMeta}>
                {post.sex} · {post.age}
              </Text>
              <Text style={styles.postVacc}>💉 {post.vaccination}</Text>
              <Text style={styles.postAddress}>📍 {post.address}</Text>
              <Text style={styles.postDesc}>{post.desc}</Text>
              <View style={styles.daysLeftPill}>
                <Text style={styles.daysLeftText}>{post.daysLeft} days left on listing</Text>
              </View>
              <Pressable onPress={() => Linking.openURL(`tel:${post.contact}`)} style={styles.contactButton}>
                <Text style={styles.contactButtonText}>📞 Contact Owner — {post.contact}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Post an Adoption Notice</Text>
        <FormField label="Dog's Name *" value={name} onChangeText={setName} />
        <FormField label="Breed *" value={breed} onChangeText={setBreed} />
        <FormField label="Age" value={age} onChangeText={setAge} placeholder="e.g. 1.5 years" />

        <Text style={styles.fieldLabel}>Sex</Text>
        <View style={styles.sexRow}>
          {(["Male", "Female"] as const).map((s) => (
            <Pressable key={s} onPress={() => setSex(s)} style={[styles.sexChip, sex === s && styles.sexChipActive]}>
              <Text style={[styles.sexChipText, sex === s && styles.sexChipTextActive]}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <FormField label="Description" value={desc} onChangeText={setDesc} />
        <FormField label="Contact Number" value={contact} onChangeText={setContact} placeholder="98XXXXXXXX" />

        {posted && <Text style={styles.successText}>✓ Your adoption notice is live.</Text>}
        <Pressable onPress={submit} disabled={!canSave} style={[styles.postButton, !canSave && styles.postButtonDisabled]}>
          <Text style={styles.postButtonText}>Post Notice</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  banner: { backgroundColor: "#EAF4F9", borderRadius: 16, padding: 20, marginBottom: 20 },
  bannerTitle: { fontWeight: "700", fontSize: 17, color: colors.text, marginBottom: 6 },
  bannerText: { fontSize: 12, color: "#3A4652", lineHeight: 17 },
  sectionTitle: { fontWeight: "700", fontSize: 15, color: colors.text, marginBottom: 14 },
  postsList: { gap: 16, marginBottom: 24 },
  postCard: { borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  postImageWrap: { position: "relative", width: "100%", aspectRatio: 1 },
  forAdoptionBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "#1F7A4D", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  forAdoptionText: { color: colors.white, fontSize: 10, fontWeight: "600" },
  postBody: { padding: 14 },
  postName: { fontSize: 14, fontWeight: "700", color: colors.text },
  postMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  postVacc: { fontSize: 11, fontWeight: "600", color: colors.primary, marginTop: 4 },
  postAddress: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  postDesc: { fontSize: 12, color: "#5B6773", lineHeight: 17, marginVertical: 8 },
  daysLeftPill: { backgroundColor: "#E6F3EC", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5, alignSelf: "flex-start", marginBottom: 10 },
  daysLeftText: { fontSize: 11, fontWeight: "600", color: "#1F7A4D" },
  contactButton: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 11, alignItems: "center" },
  contactButtonText: { color: colors.white, fontSize: 12, fontWeight: "600" },
  formCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 20 },
  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#3A4652", marginBottom: 6 },
  input: { height: 40, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, fontSize: 13, color: colors.text },
  sexRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  sexChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8, backgroundColor: "#F0F2F4" },
  sexChipActive: { backgroundColor: colors.primary },
  sexChipText: { fontSize: 12, fontWeight: "600", color: "#5B6773" },
  sexChipTextActive: { color: colors.white },
  successText: { fontSize: 12, color: "#1F7A4D", marginBottom: 10 },
  postButton: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 13, alignItems: "center" },
  postButtonDisabled: { opacity: 0.4 },
  postButtonText: { color: colors.white, fontSize: 14, fontWeight: "600" },
});
