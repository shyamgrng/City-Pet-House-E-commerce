// Field names match the website's PaymentMethod type (apps/web/src/lib/payment-methods-types.ts)
// exactly, so the live "cph_payment_methods" row fetched from Supabase needs no reshaping.
export type PaymentMethodKind = "dynamic-qr" | "static-qr" | "bank";

export type PaymentMethod = {
  key: string;
  label: string;
  active: boolean;
  kind: PaymentMethodKind;
  qrImage: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
};

export const PAYMENT_METHODS_FALLBACK: PaymentMethod[] = [
  { key: "fonepay", label: "Fonepay", active: true, kind: "dynamic-qr", qrImage: "", bankName: "", accountName: "", accountNumber: "" },
  { key: "esewa", label: "eSewa", active: true, kind: "static-qr", qrImage: "", bankName: "", accountName: "", accountNumber: "" },
  { key: "khalti", label: "Khalti", active: true, kind: "static-qr", qrImage: "", bankName: "", accountName: "", accountNumber: "" },
];
