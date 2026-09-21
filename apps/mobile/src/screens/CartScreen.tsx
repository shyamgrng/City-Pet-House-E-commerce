import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius } from "../theme/colors";
import AppHeader from "../components/AppHeader";
import PlaceholderBox from "../components/PlaceholderBox";
import OrderConfirmationView from "./cart/OrderConfirmationView";
import { useCart } from "../context/CartContext";
import { formatRs } from "../lib/format";
import { calculateDeliveryFee, type Order, type OrderStatus } from "../lib/order-types";

const PAYMENT_METHODS = ["eSewa", "Khalti", "Bank Transfer"];
const STATUS_SEQUENCE: OrderStatus[] = ["Receipt Uploaded", "Payment Approved", "On the Way", "Delivered"];

export default function CartScreen() {
  const { items, subtotal, inc, dec, remove, clear } = useCart();
  const [order, setOrder] = useState<Order | null>(null);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [receiptUri, setReceiptUri] = useState("");
  const [error, setError] = useState("");
  const orderCounter = useRef(1);

  const { fee: deliveryFee, freeApplied } = calculateDeliveryFee(subtotal);
  const total = items.length > 0 ? subtotal + deliveryFee : 0;

  // Simulates the real backend's admin-approval -> dispatch -> delivered pipeline locally,
  // since there's no real backend behind this mobile prototype yet.
  useEffect(() => {
    if (!order) return;
    const currentIndex = STATUS_SEQUENCE.indexOf(order.status);
    if (currentIndex === -1 || currentIndex >= STATUS_SEQUENCE.length - 1) return;
    const timer = setTimeout(() => {
      setOrder((prev) => (prev ? { ...prev, status: STATUS_SEQUENCE[currentIndex + 1] } : prev));
    }, 4000);
    return () => clearTimeout(timer);
  }, [order]);

  const pickReceipt = async () => {
    setError("");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("We need permission to access your photos to upload the receipt.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const placeOrder = () => {
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!address.trim() || !phone.trim()) {
      setError("Please fill in your delivery address and phone.");
      return;
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    if (!receiptUri) {
      setError("Please upload your payment receipt to continue.");
      return;
    }
    const newOrder: Order = {
      id: `ORD-${String(orderCounter.current++).padStart(4, "0")}`,
      ownerName: "Guest Customer",
      ownerPhone: phone.trim(),
      address: address.trim(),
      items: items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty })),
      subtotal,
      deliveryFee,
      total,
      status: "Receipt Uploaded",
      createdAt: Date.now(),
    };
    setOrder(newOrder);
    clear();
  };

  const startNewOrder = () => {
    setOrder(null);
    setAddress("");
    setPhone("");
    setReceiptUri("");
    setError("");
  };

  if (order) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppHeader />
        <OrderConfirmationView order={order} onBackToShop={startNewOrder} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Cart & Checkout</Text>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Your cart is empty.</Text>
          </View>
        ) : (
          <View style={styles.itemsCard}>
            {items.map((it) => (
              <View key={it.productId} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <View style={styles.itemThumb}>
                    <PlaceholderBox label="" fill />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {it.name}
                    </Text>
                    <Text style={styles.itemUnitPrice}>{formatRs(it.price)} each</Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <View style={styles.qtyRow}>
                    <Pressable onPress={() => dec(it.productId)} style={styles.qtyButton}>
                      <Text style={styles.qtyButtonText}>−</Text>
                    </Pressable>
                    <Text style={styles.qtyValue}>{it.qty}</Text>
                    <Pressable onPress={() => inc(it.productId)} style={styles.qtyButton}>
                      <Text style={styles.qtyButtonText}>+</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.itemLineTotal}>{formatRs(it.price * it.qty)}</Text>
                  <Pressable onPress={() => remove(it.productId)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {items.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <Text style={styles.fieldLabel}>📍 Address</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Your delivery address"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
              <Text style={styles.fieldLabel}>📞 Phone</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="98XXXXXXXX"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                style={styles.input}
              />
              <Text style={styles.deliveryNote}>Delivery — {freeApplied ? "Free" : formatRs(deliveryFee)}</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitleInline}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatRs(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>{freeApplied ? "Free" : formatRs(deliveryFee)}</Text>
              </View>
              {freeApplied && (
                <View style={styles.freeDeliveryPill}>
                  <Text style={styles.freeDeliveryText}>Free delivery applied 🎉</Text>
                </View>
              )}
              {!freeApplied && (
                <View style={styles.unlockPill}>
                  <Text style={styles.unlockText}>Add {formatRs(2000 - subtotal)} more to unlock free delivery</Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatRs(total)}</Text>
              </View>
            </View>

            <View style={styles.paymentCard}>
              <Text style={styles.sectionTitleInline}>Payment Instructions</Text>
              <Text style={styles.paymentSubtext}>
                Pay via any of the QR codes below. Upload your receipt screenshot — your order will be held for 6 hours pending admin approval.
              </Text>
              <View style={styles.qrRow}>
                {PAYMENT_METHODS.map((pm) => (
                  <View key={pm} style={styles.qrItem}>
                    <PlaceholderBox label="QR" height={80} radius={10} />
                    <Text style={styles.qrLabel}>{pm}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.fieldLabel}>
                Upload Payment Receipt <Text style={styles.required}>*</Text>
              </Text>
              {receiptUri ? (
                <View style={styles.receiptWrap}>
                  <Image source={{ uri: receiptUri }} style={styles.receiptImage} resizeMode="contain" />
                  <Pressable onPress={pickReceipt}>
                    <Text style={styles.replaceLink}>Replace</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={pickReceipt} style={styles.dropZone}>
                  <Text style={styles.dropZoneText}>Tap to upload your payment receipt screenshot</Text>
                </Pressable>
              )}
            </View>

            {error !== "" && <Text style={styles.error}>{error}</Text>}
            <Pressable onPress={placeOrder} style={styles.placeOrderButton}>
              <Text style={styles.placeOrderButtonText}>Place Order & Upload Receipt</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontWeight: "700", fontSize: 20, color: colors.text, marginBottom: 16 },
  emptyCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 40,
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: { fontSize: 13, color: colors.textMuted },
  itemsCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 10, overflow: "hidden", marginBottom: 20 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F2F4" },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
  itemThumb: { width: 44, height: 44, borderRadius: 8, overflow: "hidden" },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 13, fontWeight: "600", color: colors.text },
  itemUnitPrice: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  itemRight: { alignItems: "flex-end", gap: 4 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyButton: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  qtyButtonText: { fontWeight: "700", color: "#3A4652" },
  qtyValue: { width: 20, textAlign: "center", fontSize: 12, fontWeight: "600" },
  itemLineTotal: { fontSize: 13, fontWeight: "700", color: colors.text },
  removeText: { fontSize: 11, fontWeight: "600", color: colors.error },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 10 },
  sectionTitleInline: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 12 },
  addressCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginBottom: 20 },
  fieldLabel: { fontSize: 11, fontWeight: "600", color: "#3A4652", marginBottom: 6 },
  input: { height: 40, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, fontSize: 13, color: colors.text, marginBottom: 12 },
  deliveryNote: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  summaryCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginBottom: 20 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  summaryLabel: { fontSize: 12, color: "#5B6773" },
  summaryValue: { fontSize: 12, fontWeight: "600", color: colors.text },
  freeDeliveryPill: { backgroundColor: "#E7F3EC", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, alignSelf: "flex-start", marginVertical: 4 },
  freeDeliveryText: { fontSize: 11, fontWeight: "600", color: "#1F7A4D" },
  unlockPill: { backgroundColor: "#EAF4F9", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, marginVertical: 4 },
  unlockText: { fontSize: 11, color: "#146A8C" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, marginTop: 6, borderTopWidth: 1, borderTopColor: "#F0F2F4" },
  totalLabel: { fontSize: 14, fontWeight: "700", color: colors.text },
  totalValue: { fontSize: 18, fontWeight: "700", color: colors.primary },
  paymentCard: { backgroundColor: "#EAF4F9", borderWidth: 1, borderColor: "#CFE6F1", borderRadius: 12, padding: 18, marginBottom: 16 },
  paymentSubtext: { fontSize: 12, color: "#5B6773", lineHeight: 17, marginBottom: 14 },
  qrRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 16 },
  qrItem: { alignItems: "center", gap: 6, width: 80 },
  qrLabel: { fontSize: 11, fontWeight: "600", color: colors.text },
  required: { color: colors.error },
  receiptWrap: { gap: 8 },
  receiptImage: { width: "100%", height: 200, borderRadius: 10, borderWidth: 1, borderColor: "#C7DCE6", backgroundColor: colors.white },
  replaceLink: { fontSize: 12, fontWeight: "600", color: colors.primary },
  dropZone: { height: 110, borderRadius: 10, borderWidth: 2, borderStyle: "dashed", borderColor: "#C7DCE6", backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  dropZoneText: { fontSize: 12, color: colors.textMuted, paddingHorizontal: 20, textAlign: "center" },
  error: { fontSize: 12, color: colors.error, marginBottom: 12 },
  placeOrderButton: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 14, alignItems: "center" },
  placeOrderButtonText: { color: colors.white, fontSize: 14, fontWeight: "600" },
});
