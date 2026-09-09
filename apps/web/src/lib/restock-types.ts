export type RestockStatus = "Pending" | "Accepted" | "Declined" | "Dispatched" | "Delivered";

export type RestockInitiator = "Admin" | "Supplier";

export type RestockOrder = {
  id: string;
  b2bId: string;
  companyName: string;
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  note: string;
  initiatedBy: RestockInitiator;
  status: RestockStatus;
  createdAt: number;
  respondedAt?: number;
  dispatchedAt?: number;
  deliveredAt?: number;
};

export const RESTOCK_STATUS_COLORS: Record<RestockStatus, string> = {
  Pending: "#B8860B",
  Accepted: "#1996C8",
  Declined: "#D64545",
  Dispatched: "#7A56C8",
  Delivered: "#1F7A4D",
};

export function restockValue(order: RestockOrder) {
  return order.qty * order.unitPrice;
}

/** True when it's the supplier's turn to accept/decline (an admin-initiated request awaiting them). */
export function awaitsSupplier(order: RestockOrder) {
  return order.status === "Pending" && order.initiatedBy === "Admin";
}

/** True when it's City Pet House's turn to accept/decline (a supplier-initiated offer awaiting them). */
export function awaitsAdmin(order: RestockOrder) {
  return order.status === "Pending" && order.initiatedBy === "Supplier";
}
