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

export function deliveryTimeline(d: Delivery) {
  const order: DeliveryStatus[] = ["Dispatched", "Received", "Processing", "Delivered"];
  const idx = order.indexOf(d.status);
  return [
    { label: "Handed to Courier", done: idx >= 0 },
    { label: "Item Received by Courier", done: idx >= 1 },
    { label: "Delivery Person Assigned", done: idx >= 2 },
    { label: "Delivered to Customer", done: idx >= 3 },
  ];
}
