export type DeliveryStatus = "Awaiting Courier" | "Dispatched" | "Received" | "Processing" | "Delivered" | "Cancelled";

export type Delivery = {
  id: string;
  client: string;
  phone: string;
  address: string;
  amount: number;
  checklist: string[];
  status: DeliveryStatus;
  courierId?: string;
  courierName?: string;
  dpName?: string;
  dpPhone?: string;
  dispatchedAt?: number;
  deliveredAt?: number;
  cancelReason?: string;
};

export const STATUS_COLORS: Record<DeliveryStatus, string> = {
  "Awaiting Courier": "#8A96A3",
  Dispatched: "#C9962B",
  Received: "#1996C8",
  Processing: "#1996C8",
  Delivered: "#1F7A4D",
  Cancelled: "#D64545",
};

export type DeliveryTimelineStep = { key: string; title: string; subtitle: string; icon: string; done: boolean };

/** Mirrors the client-facing order timeline (orderTimeline in order-types.ts) so a courier sees
 * the same numbered/icon-circle style with a title + subtitle per step, not just a bare checklist. */
export function deliveryTimeline(d: Delivery): DeliveryTimelineStep[] {
  const order: DeliveryStatus[] = ["Dispatched", "Received", "Processing", "Delivered"];
  const idx = order.indexOf(d.status);
  return [
    { key: "dispatched", title: "Handed to Courier", subtitle: "Order picked up from City Pet House for delivery", icon: "1", done: idx >= 0 },
    { key: "received", title: "Item Received by Courier", subtitle: "Package received and confirmed by your team", icon: "📦", done: idx >= 1 },
    {
      key: "assigned",
      title: "Delivery Person Assigned",
      subtitle: d.dpName ? `Assigned to ${d.dpName}` : "A delivery person will be assigned next",
      icon: "🧑",
      done: idx >= 2,
    },
    { key: "delivered", title: "Delivered to Customer", subtitle: "Order delivered to the customer's address", icon: "✓", done: idx >= 3 },
  ];
}
