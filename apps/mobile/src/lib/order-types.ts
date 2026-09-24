export type OrderStatus = "Receipt Uploaded" | "Payment Approved" | "Payment Rejected" | "On the Way" | "Delivered";

export const STATUS_COLORS: Record<OrderStatus, string> = {
  "Receipt Uploaded": "#C88A19",
  "Payment Approved": "#1F7A4D",
  "Payment Rejected": "#D64545",
  "On the Way": "#1996C8",
  Delivered: "#5B6773",
};

export type Order = {
  id: string;
  ownerName: string;
  ownerPhone: string;
  address: string;
  items: { productId: string; name: string; price: number; qty: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  fonepayVerified?: boolean;
  createdAt: number;
};

/** "Receipt Uploaded" predates removing receipt upload and would now read as if a receipt is
 * still involved, so it's shown as "Awaiting Approval" instead. The underlying stored value is
 * left unchanged so the status-progression logic elsewhere keeps working. */
export function orderStatusLabel(status: OrderStatus): string {
  return status === "Receipt Uploaded" ? "Awaiting Approval" : status;
}

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
  ];
}

/** Simplified flat-rate delivery fee: matches the "Free delivery... on orders over Rs. 2,000"
 * copy already used elsewhere in this app, standing in for the real site's package-size-tier
 * + value-tier delivery fee engine (needs courier/product package-size data not modeled here). */
export const FLAT_DELIVERY_FEE = 150;
export const FREE_DELIVERY_THRESHOLD = 2000;

export function calculateDeliveryFee(subtotal: number): { fee: number; freeApplied: boolean } {
  if (subtotal === 0) return { fee: 0, freeApplied: false };
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return { fee: 0, freeApplied: true };
  return { fee: FLAT_DELIVERY_FEE, freeApplied: false };
}
