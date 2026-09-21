import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "../../theme/colors";
import { formatRs } from "../../lib/format";
import { orderTimeline, STATUS_COLORS, type Order } from "../../lib/order-types";

function ProductReview({ name }: { name: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <View style={styles.reviewDone}>
        <Text style={styles.reviewDoneText}>✓ Thanks — your review for {name} has been submitted.</Text>
      </View>
    );
  }

  return (
    <View style={styles.reviewCard}>
      <Text style={styles.reviewName}>{name}</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setRating(n)} hitSlop={4}>
            <Text style={[styles.star, n <= rating && styles.starActive]}>★</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Share your experience…"
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={2}
        style={styles.reviewInput}
      />
      <Pressable
        onPress={() => rating > 0 && setSubmitted(true)}
        disabled={rating === 0}
        style={[styles.reviewSubmit, rating === 0 && styles.reviewSubmitDisabled]}
      >
        <Text style={styles.reviewSubmitText}>Submit Review</Text>
      </Pressable>
    </View>
  );
}

export default function OrderConfirmationView({ order, onBackToShop }: { order: Order; onBackToShop: () => void }) {
  const timeline = orderTimeline(order);
  const fmtDate = (ts: number) => {
    const d = new Date(ts);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable onPress={onBackToShop}>
        <Text style={styles.backLink}>← Back to Shop</Text>
      </Pressable>

      <Text style={styles.orderId}>{order.id}</Text>
      <Text style={styles.orderMeta}>
        {fmtDate(order.createdAt)} · {formatRs(order.total)}
      </Text>

      <View style={styles.timeline}>
        {timeline.map((step, i) => (
          <View key={step.key} style={styles.timelineRow}>
            <View style={styles.timelineIconCol}>
              <View style={[styles.timelineDot, step.done && styles.timelineDotDone]}>
                <Text style={styles.timelineDotIcon}>{step.icon}</Text>
              </View>
              {i < timeline.length - 1 && <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />}
            </View>
            <View style={styles.timelineBody}>
              <Text style={[styles.timelineTitle, !step.done && styles.timelineTitleMuted]}>{step.title}</Text>
              <Text style={styles.timelineSubtitle}>{step.subtitle}</Text>

              {step.key === "placed" && (
                <View style={styles.invoiceCard}>
                  <Text style={styles.invoiceLabel}>INVOICE</Text>
                  {order.items.map((it) => (
                    <View key={it.productId} style={styles.invoiceRow}>
                      <Text style={styles.invoiceItemName}>
                        {it.name} × {it.qty}
                      </Text>
                      <Text style={styles.invoiceItemPrice}>{formatRs(it.price * it.qty)}</Text>
                    </View>
                  ))}
                  <View style={styles.invoiceRow}>
                    <Text style={styles.invoiceMutedText}>Delivery Fee</Text>
                    <Text style={styles.invoiceMutedText}>{formatRs(order.deliveryFee)}</Text>
                  </View>
                  <View style={[styles.invoiceRow, styles.invoiceTotalRow]}>
                    <Text style={styles.invoiceTotalText}>Total</Text>
                    <Text style={styles.invoiceTotalText}>{formatRs(order.total)}</Text>
                  </View>
                </View>
              )}

              {step.key === "receipt" && (
                <View style={styles.receiptNote}>
                  <Text style={styles.receiptNoteText}>📎 Payment receipt uploaded — held for admin review, usually within a few hours</Text>
                </View>
              )}

              {step.key === "delivered" && order.status === "Delivered" && (
                <View style={styles.reviewList}>
                  {order.items.map((it) => (
                    <ProductReview key={it.productId} name={it.name} />
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.receiverCard}>
        <Text style={styles.receiverTitle}>Receiver Details</Text>
        <Text style={styles.receiverLine}>{order.ownerName}</Text>
        <Text style={styles.receiverLine}>📞 {order.ownerPhone}</Text>
        <Text style={styles.receiverLine}>📍 {order.address}</Text>
        <Text style={[styles.receiverStatus, { color: STATUS_COLORS[order.status] }]}>Status: {order.status}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  backLink: { fontSize: 13, fontWeight: "600", color: colors.primary, marginBottom: 16 },
  orderId: { fontWeight: "700", fontSize: 15, color: colors.text, marginBottom: 4 },
  orderMeta: { fontSize: 12, color: colors.textMuted, marginBottom: 20 },
  timeline: { marginBottom: 20 },
  timelineRow: { flexDirection: "row", gap: 12 },
  timelineIconCol: { alignItems: "center" },
  timelineDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#D8DEE2", alignItems: "center", justifyContent: "center" },
  timelineDotDone: { backgroundColor: "#1F7A4D" },
  timelineDotIcon: { fontSize: 11, color: colors.white },
  timelineLine: { width: 2, flex: 1, backgroundColor: "#D8DEE2", marginVertical: 2 },
  timelineLineDone: { backgroundColor: "#1F7A4D" },
  timelineBody: { flex: 1, paddingBottom: 20 },
  timelineTitle: { fontSize: 13, fontWeight: "700", color: colors.text },
  timelineTitleMuted: { color: colors.textMuted },
  timelineSubtitle: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  invoiceCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginTop: 10 },
  invoiceLabel: { fontSize: 10, fontWeight: "700", color: colors.textMuted, marginBottom: 8 },
  invoiceRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  invoiceItemName: { fontSize: 12, color: "#3A4652", flex: 1, paddingRight: 8 },
  invoiceItemPrice: { fontSize: 12, fontWeight: "600", color: colors.text },
  invoiceMutedText: { fontSize: 12, color: colors.textMuted },
  invoiceTotalRow: { paddingTop: 6, marginTop: 4, borderTopWidth: 1, borderTopColor: colors.border },
  invoiceTotalText: { fontSize: 12, fontWeight: "700", color: colors.text },
  receiptNote: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginTop: 10 },
  receiptNoteText: { fontSize: 12, color: "#3A4652" },
  reviewList: { marginTop: 10, gap: 10 },
  reviewCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12 },
  reviewName: { fontSize: 12, fontWeight: "600", color: colors.text, marginBottom: 8 },
  starsRow: { flexDirection: "row", gap: 4, marginBottom: 8 },
  star: { fontSize: 20, color: "#D8DEE2" },
  starActive: { color: "#FFC940" },
  reviewInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, color: colors.text, marginBottom: 8, minHeight: 50, textAlignVertical: "top" },
  reviewSubmit: { backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 7, alignSelf: "flex-start" },
  reviewSubmitDisabled: { opacity: 0.4 },
  reviewSubmitText: { color: colors.white, fontSize: 11, fontWeight: "600" },
  reviewDone: { backgroundColor: "#EAF6EE", borderWidth: 1, borderColor: "#CFE9D8", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12 },
  reviewDoneText: { fontSize: 12, color: "#1F7A4D" },
  receiverCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16 },
  receiverTitle: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 8 },
  receiverLine: { fontSize: 12, color: "#5B6773", marginTop: 2 },
  receiverStatus: { fontSize: 11, fontWeight: "700", marginTop: 10 },
});
