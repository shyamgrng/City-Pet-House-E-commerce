import type { PaymentMethod } from "@/lib/payment-methods-types";

export const paymentMethodsSeed: PaymentMethod[] = [
  { key: "fonepay", label: "Fonepay", active: true, kind: "dynamic-qr", qrImage: "", bankName: "", accountName: "", accountNumber: "" },
  { key: "esewa", label: "eSewa", active: true, kind: "static-qr", qrImage: "", bankName: "", accountName: "", accountNumber: "" },
  { key: "khalti", label: "Khalti", active: true, kind: "static-qr", qrImage: "", bankName: "", accountName: "", accountNumber: "" },
  { key: "bank", label: "Bank Transfer", active: false, kind: "bank", qrImage: "", bankName: "", accountName: "", accountNumber: "" },
];
