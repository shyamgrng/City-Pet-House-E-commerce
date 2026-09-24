import { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { colors } from "../theme/colors";
import { formatRs } from "../lib/format";
import { useFonepayPayment } from "../lib/use-fonepay-payment";
import type { PaymentMethod } from "../lib/payment-methods";
import PlaceholderBox from "./PlaceholderBox";

export default function PaymentMethodPanel({
  methods,
  amount,
  reference,
  remarks1,
  remarks2,
  selectedKey,
  onSelect,
  onFonepayVerifiedChange,
}: {
  methods: PaymentMethod[];
  amount: number;
  reference: string;
  remarks1: string;
  remarks2: string;
  selectedKey: string;
  onSelect: (key: string) => void;
  onFonepayVerifiedChange?: (verified: boolean) => void;
}) {
  const selected = methods.find((m) => m.key === selectedKey) ?? methods[0];

  return (
    <View>
      {methods.length > 1 && (
        <View style={styles.tabRow}>
          {methods.map((m) => (
            <Pressable key={m.key} onPress={() => onSelect(m.key)} style={[styles.tab, selected?.key === m.key && styles.tabActive]}>
              <Text style={[styles.tabText, selected?.key === m.key && styles.tabTextActive]}>{m.label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {selected?.kind === "dynamic-qr" && (
        <FonepayPanel method={selected} amount={amount} reference={reference} remarks1={remarks1} remarks2={remarks2} onVerifiedChange={onFonepayVerifiedChange} />
      )}
      {selected?.kind === "static-qr" && <StaticQrPanel method={selected} amount={amount} />}
      {selected?.kind === "bank" && <BankPanel method={selected} amount={amount} />}
      {!selected && <Text style={styles.emptyText}>No payment method is available right now.</Text>}
    </View>
  );
}

function FonepayPanel({
  method,
  amount,
  reference,
  remarks1,
  remarks2,
  onVerifiedChange,
}: {
  method: PaymentMethod;
  amount: number;
  reference: string;
  remarks1: string;
  remarks2: string;
  onVerifiedChange?: (verified: boolean) => void;
}) {
  const { qrMessage, loading, error, verified } = useFonepayPayment(reference, amount, remarks1, remarks2, true);

  useEffect(() => {
    onVerifiedChange?.(verified);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified]);

  return (
    <View style={styles.center}>
      <Text style={styles.hint}>Scan with any {method.label}-connected banking app</Text>
      <Text style={styles.amount}>Pay exactly {formatRs(amount)}</Text>

      {loading && (
        <View style={[styles.qrBox, styles.qrBoxLoading]}>
          <Text style={styles.loadingText}>Loading QR…</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {qrMessage && !loading && !error && (
        <View style={styles.qrCard}>
          <QRCode value={qrMessage} size={200} />
        </View>
      )}

      {verified ? (
        <View style={styles.verifiedPill}>
          <Text style={styles.verifiedText}>✓ Payment received via Fonepay</Text>
        </View>
      ) : (
        <Text style={styles.waitingText}>We&apos;ll detect your payment automatically once it goes through.</Text>
      )}
    </View>
  );
}

function StaticQrPanel({ method, amount }: { method: PaymentMethod; amount: number }) {
  return (
    <View style={styles.center}>
      <Text style={styles.amount}>Pay exactly {formatRs(amount)}</Text>
      <View style={styles.staticQrWrap}>
        {method.qrImage ? (
          <Image source={{ uri: method.qrImage }} style={StyleSheet.absoluteFill} resizeMode="contain" />
        ) : (
          <PlaceholderBox label={`${method.label} QR`} fill />
        )}
      </View>
      <Text style={styles.methodLabel}>{method.label}</Text>
    </View>
  );
}

function BankPanel({ method, amount }: { method: PaymentMethod; amount: number }) {
  return (
    <View>
      <Text style={styles.amount}>Transfer exactly {formatRs(amount)}</Text>
      <View style={styles.bankCard}>
        <BankRow label="Bank" value={method.bankName} />
        <BankRow label="Account Name" value={method.accountName} />
        <BankRow label="Account Number" value={method.accountNumber} />
      </View>
    </View>
  );
}

function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.bankRow}>
      <Text style={styles.bankRowLabel}>{label}</Text>
      <Text style={styles.bankRowValue}>{value || "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: "600", color: "#3A4652" },
  tabTextActive: { color: colors.white },
  center: { alignItems: "center" },
  hint: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  amount: { fontWeight: "700", fontSize: 20, color: colors.text, marginBottom: 16, textAlign: "center" },
  qrBox: { width: 200, height: 200, marginBottom: 12, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  qrBoxLoading: { backgroundColor: colors.surface },
  loadingText: { fontSize: 12, color: colors.textMuted },
  errorBox: { width: 220, backgroundColor: "#FDEDEC", borderWidth: 1, borderColor: "#F3C6C2", borderRadius: 10, padding: 14, marginBottom: 12 },
  errorText: { fontSize: 12, color: colors.error, textAlign: "center" },
  qrCard: { padding: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginBottom: 12 },
  verifiedPill: { backgroundColor: "#E7F3EC", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  verifiedText: { fontSize: 11, fontWeight: "600", color: "#1F7A4D" },
  waitingText: { fontSize: 11, color: colors.textMuted, textAlign: "center" },
  staticQrWrap: { width: 180, height: 180, marginBottom: 8, borderRadius: 10, overflow: "hidden", backgroundColor: colors.surface, position: "relative" },
  methodLabel: { fontSize: 11, fontWeight: "600", color: colors.text },
  bankCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14 },
  bankRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.border },
  bankRowLabel: { fontSize: 11, color: colors.textMuted },
  bankRowValue: { fontSize: 13, fontWeight: "600", color: colors.text },
  emptyText: { fontSize: 12, color: colors.textMuted, textAlign: "center", paddingVertical: 16 },
});
