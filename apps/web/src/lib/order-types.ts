export type OrderStatus = "Receipt Uploaded" | "Payment Approved" | "Payment Rejected" | "On the Way" | "Delivered";

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
};

export type OrderReview = { rating: number; comment: string };

export type ChecklistItem = { text: string; checked: boolean };
export type RefundedItem = { productId: string; name: string; price: number; refundId: string };

export function defaultChecklist(): ChecklistItem[] {
  return [
    { text: "Items picked from shelf", checked: false },
    { text: "Packed & labeled", checked: false },
    { text: "Invoice printed", checked: false },
  ];
}

/** Per-B2B-supplier packing checklist for their item(s) within one order, ahead of physically sending stock to CPH. */
export type SupplierFulfillment = {
  b2bId: string;
  checklist: ChecklistItem[];
  sentAt?: number;
};

export function defaultSupplierChecklist(): ChecklistItem[] {
  return [
    { text: "Items picked from shelf", checked: false },
    { text: "Packed & labeled", checked: false },
  ];
}

export type Order = {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  /** Internal only -- what the courier actually cost us for this order's delivery. Never shown
   * to the customer; used for delivery margin tracking in Admin Finance. */
  courierCost?: number;
  courierName?: string;
  status: OrderStatus;
  /** Absent for orders placed after receipt upload was removed in favor of QR/bank payment. */
  receiptPhoto?: string;
  paymentMethod: string;
  /** Set only for Fonepay payments once its status API confirms the transfer went through --
   * a convenience signal for admin, never a substitute for their manual approval. */
  fonepayVerified?: boolean;
  rejectReason?: string;
  createdAt: number;
  approvedAt?: number;
  deliveredAt?: number;
  reviews?: Record<string, OrderReview>;
  checklist: ChecklistItem[];
  refunded: boolean;
  refundedItems: RefundedItem[];
  /** Absent for orders with no B2B-supplied items, or before a supplier has interacted with theirs. */
  supplierFulfillments?: SupplierFulfillment[];
};

/** Display text for a status — "Receipt Uploaded" predates removing receipt upload and would
 * now read as if a receipt is still involved, so it's shown as "Awaiting Approval" instead.
 * The underlying stored value is left unchanged so existing comparisons/filters keep working. */
export function orderStatusLabel(status: OrderStatus): string {
  return status === "Receipt Uploaded" ? "Awaiting Approval" : status;
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
  "Receipt Uploaded": "#C88A19",
  "Payment Approved": "#1F7A4D",
  "Payment Rejected": "#D64545",
  "On the Way": "#1996C8",
  Delivered: "#5B6773",
};

export type TimelineStep = { key: string; title: string; subtitle: string; icon: string; done: boolean };

export function orderTimeline(order: Order): TimelineStep[] {
  const rank: Record<OrderStatus, number> = {
    "Receipt Uploaded": 1,
    "Payment Rejected": 1,
    "Payment Approved": 2,
    "On the Way": 3,
    Delivered: 4,
  };
  const r = rank[order.status];
  return [
    { key: "placed", title: "Order Placed", subtitle: "Order confirmed · emailed to you & admin", icon: "1", done: true },
    { key: "receipt", title: "Payment Submitted", subtitle: "Your payment is waiting for admin approval", icon: "💳", done: true },
    {
      key: "approved",
      title: "Payment Approved",
      subtitle: order.status === "Payment Rejected" ? "Receipt was rejected — see reason below" : "Payment verified — your order is being packed",
      icon: "✓",
      done: r >= 2,
    },
    { key: "ontheway", title: "On the Way", subtitle: "Handed to courier for delivery", icon: "🚚", done: r >= 3 },
    { key: "delivered", title: "Delivered", subtitle: "Order delivered to your address", icon: "✓", done: r >= 4 },
    { key: "review", title: "Review the Products", subtitle: "Rate your order once delivered", icon: "★", done: false },
  ];
}
