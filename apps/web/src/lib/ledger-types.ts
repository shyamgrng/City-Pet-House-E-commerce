export type PartyType = "b2b" | "doctor" | "courier";

export type LedgerCategory = "accessories" | "pet_sales" | "vet";

export const PARTY_TYPE_LABELS: Record<PartyType, string> = {
  b2b: "B2B Supplier",
  doctor: "Doctor",
  courier: "Courier",
};

export const CATEGORY_LABELS: Record<LedgerCategory, string> = {
  accessories: "Shop / Accessories",
  pet_sales: "Pet Sales",
  vet: "Web Vet",
};

export type PaymentMethod = "bank_transfer" | "esewa" | "khalti" | "cash";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: "Bank Transfer",
  esewa: "eSewa",
  khalti: "Khalti",
  cash: "Cash",
};

/**
 * A recorded payout to a B2B supplier, doctor, or courier — the one piece of money-movement
 * that has no other source of truth in the app (everything else the ledger shows — sales,
 * commission, payables — is derived live from existing orders/bookings/deliveries).
 */
export type LedgerPayment = {
  id: string;
  partyType: PartyType;
  partyId: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  reference: string;
  notes: string;
  receiptPhoto: string;
  createdAt: number;
  /** Order/booking/delivery refs (vch no.) this payment is settling, if the admin picked any from
   * the party's outstanding list. Empty for a flexible/advance payment not tied to a specific
   * invoice. */
  linkedRefs: string[];
};

export type NewLedgerPayment = Omit<LedgerPayment, "id" | "createdAt">;
