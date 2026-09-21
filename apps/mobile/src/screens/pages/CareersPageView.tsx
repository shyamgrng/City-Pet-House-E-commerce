import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../theme/colors";
import PlaceholderBox from "../../components/PlaceholderBox";
import { CAREER_HEADLINE, CAREER_JOBS } from "../../lib/static-content";

export default function CareersPageView() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <PlaceholderBox label="career banner image" height={160} radius={12} />
      <Text style={styles.headline}>{CAREER_HEADLINE}</Text>

      <Text style={styles.sectionTitle}>Open Positions</Text>
      <View style={styles.jobList}>
        {CAREER_JOBS.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <PlaceholderBox label="job photo" height={110} radius={10} />
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobTag}>{job.tag}</Text>
            <Text style={styles.jobDesc}>{job.desc}</Text>
            <Pressable
              onPress={() => Alert.alert("Interest sent", `We've noted your interest in ${job.title}. Our team will reach out.`)}
              style={styles.applyButton}
            >
              <Text style={styles.applyButtonText}>Express Interest</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  headline: { fontWeight: "800", fontSize: 20, color: colors.text, lineHeight: 27, marginTop: 18, marginBottom: 22 },
  sectionTitle: { fontWeight: "700", fontSize: 17, color: colors.text, marginBottom: 14 },
  jobList: { gap: 16 },
  jobCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 18 },
  jobTitle: { fontWeight: "700", fontSize: 15, color: colors.text, marginTop: 12, marginBottom: 2 },
  jobTag: { fontSize: 11, fontWeight: "600", color: colors.primary, marginBottom: 10 },
  jobDesc: { fontSize: 12, color: "#5B6773", lineHeight: 18, marginBottom: 16 },
  applyButton: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 11, alignItems: "center" },
  applyButtonText: { color: colors.white, fontSize: 12, fontWeight: "700" },
});
