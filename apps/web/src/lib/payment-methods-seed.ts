import type { PaymentMethod } from "@/lib/payment-methods-types";

export const paymentMethodsSeed: PaymentMethod[] = [
  { key: "fonepay", label: "Fonepay", active: true, qrImage: "" },
  { key: "esewa", label: "eSewa", active: true, qrImage: "" },
  { key: "khalti", label: "Khalti", active: true, qrImage: "" },
];
