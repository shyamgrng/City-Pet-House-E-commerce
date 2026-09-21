import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import PlaceholderBox from "../../components/PlaceholderBox";
import { BLOG_POSTS_FULL } from "../../lib/static-content";

export default function BlogPageView() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Blog</Text>
      <View style={styles.list}>
        {BLOG_POSTS_FULL.map((post) => (
          <Pressable key={post.id} style={styles.card}>
            <PlaceholderBox label="article photo" height={130} />
            <View style={styles.cardBody}>
              <Text style={styles.meta}>
                {post.author} · {post.date}
              </Text>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.excerpt}>{post.excerpt}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  title: { fontWeight: "700", fontSize: 20, color: colors.text, marginBottom: 18 },
  list: { gap: 16 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: "hidden" },
  cardBody: { padding: 14 },
  meta: { fontSize: 11, color: colors.textMuted, marginBottom: 6 },
  postTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 8, lineHeight: 19 },
  excerpt: { fontSize: 12, color: "#5B6773", lineHeight: 17 },
});
