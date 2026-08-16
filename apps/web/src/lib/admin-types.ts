export interface AdminOrderItem {
  id: string;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
  supplierId: string | null;
  outOfStock: boolean;
  refundRequested: boolean;
  sentToCph: boolean;
}

export interface AdminChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  checkedAt: string | null;
  checkedBy: string | null;
}

export interface AdminStatusEvent {
  id: string;
  stage: string;
  actor: string | null;
  note: string | null;
  at: string;
}

export interface AdminOrder {
  id: string;
  buyerId: string;
  addressSnapshot: { label: string; address: string; phone: string; altPhone: string | null };
  amount: number;
  deliveryFee: number;
  paymentMethod: string;
  paymentReceiptUrl: string;
  paymentStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  stage: "PAYMENT_QUEUE" | "CONFIRMED" | "DISPATCH" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
  cancellationReason: string | null;
  createdAt: string;
  items: AdminOrderItem[];
  checklist: AdminChecklistItem[];
  statusHistory: AdminStatusEvent[];
  buyer: { name: string };
}
