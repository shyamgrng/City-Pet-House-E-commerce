/** "dynamic-qr": a live QR generated per-payment with the exact amount baked in (currently only
 * Fonepay, via its Merchant Dynamic QR API — see apps/web/src/lib/fonepay.ts). "static-qr": a
 * QR image admin uploads once (eSewa, Khalti, ...); the amount is shown as text next to it
 * since the image itself can't encode a per-payment amount. "bank": bank account details shown
 * as text, no QR at all. */
export type PaymentMethodKind = "dynamic-qr" | "static-qr" | "bank";

export type PaymentMethod = {
  key: string;
  label: string;
  active: boolean;
  kind: PaymentMethodKind;
  /** Used when kind === "static-qr". */
  qrImage: string;
  /** Used when kind === "bank". */
  bankName: string;
  accountName: string;
  accountNumber: string;
};
