export type OrderStatus = "Receipt Uploaded" | "Payment Approved" | "Payment Rejected" | "On the Way" | "Delivered";

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
};

export type OrderReview = { rating: number; comment: string };

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
  status: OrderStatus;
  rejectReason?: string;
  createdAt: number;
  approvedAt?: number;
  deliveredAt?: number;
  reviews?: Record<string, OrderReview>;
};

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
    { key: "receipt", title: "Receipt Uploaded", subtitle: "Payment receipt submitted for review", icon: "📎", done: true },
    {
      key: "approved",
      title: "Payment Approved",
      subtitle: order.status === "Payment Rejected" ? "Receipt was rejected — see reason below" : "Stock committed & invoice issued",
      icon: "✓",
      done: r >= 2,
    },
    { key: "ontheway", title: "On the Way", subtitle: "Handed to courier for delivery", icon: "🚚", done: r >= 3 },
    { key: "delivered", title: "Delivered", subtitle: "Order delivered to your address", icon: "✓", done: r >= 4 },
    { key: "review", title: "Review the Products", subtitle: "Rate your order once delivered", icon: "★", done: false },
  ];
}
