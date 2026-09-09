import type { B2BProductSubmission } from "./b2b-types";
import type { Product } from "./catalog-types";
import type { Order } from "./order-types";

export type SupplierActivity = { key: string; text: string; time: number };

function myProductIds(submissions: B2BProductSubmission[], b2bId: string): Set<string> {
  return new Set(submissions.filter((s) => s.b2bId === b2bId && s.productId).map((s) => s.productId as string));
}

function commissionFor(submissions: B2BProductSubmission[], productId: string): number {
  return submissions.find((s) => s.productId === productId)?.commissionPct ?? 0;
}

/** Orders containing at least one item supplied by this B2B account. */
export function ordersForSupplier(orders: Order[], submissions: B2BProductSubmission[], b2bId: string): Order[] {
  const ids = myProductIds(submissions, b2bId);
  return orders.filter((o) => o.items.some((it) => ids.has(it.productId)));
}

/** Orders received, excluding attempts where payment was rejected (never actually went through). */
export function ordersReceivedCount(orders: Order[], submissions: B2BProductSubmission[], b2bId: string): number {
  return ordersForSupplier(orders, submissions, b2bId).filter((o) => o.status !== "Payment Rejected").length;
}

export function lowStockCount(products: Product[], submissions: B2BProductSubmission[], b2bId: string): number {
  const ids = myProductIds(submissions, b2bId);
  return products.filter((p) => ids.has(p.id) && (p.outOfStock || p.qty <= p.lowStockAlert)).length;
}

/**
 * Net amount City Pet House owes this supplier: (sale price minus commission) summed across
 * every non-rejected order's items for this supplier, less the same for any refunded items.
 * There's no separate payout/settlement ledger yet, so this is the running total to date.
 */
export function amountDue(orders: Order[], submissions: B2BProductSubmission[], b2bId: string): number {
  const ids = myProductIds(submissions, b2bId);
  let total = 0;
  for (const o of orders) {
    if (o.status === "Payment Rejected") continue;
    for (const it of o.items) {
      if (!ids.has(it.productId)) continue;
      total += it.price * it.qty * (1 - commissionFor(submissions, it.productId) / 100);
    }
    for (const r of o.refundedItems) {
      if (!ids.has(r.productId)) continue;
      total -= r.price * (1 - commissionFor(submissions, r.productId) / 100);
    }
  }
  return Math.round(total);
}

/** Net sales value (post-commission) per day for the last 7 days, oldest first. */
export function weeklySales(orders: Order[], submissions: B2BProductSubmission[], b2bId: string): { label: string; count: number }[] {
  const ids = myProductIds(submissions, b2bId);
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date(today);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    let sum = 0;
    for (const o of orders) {
      if (o.status === "Payment Rejected") continue;
      if (o.createdAt < start.getTime() || o.createdAt >= end.getTime()) continue;
      for (const it of o.items) {
        if (!ids.has(it.productId)) continue;
        sum += it.price * it.qty * (1 - commissionFor(submissions, it.productId) / 100);
      }
    }
    buckets.push({ label: dayLabels[start.getDay()], count: Math.round(sum) });
  }
  return buckets;
}

/** Derived activity feed — order placed / payment received / rejected / delivered / refunded — newest first. */
export function recentActivity(orders: Order[], submissions: B2BProductSubmission[], b2bId: string, limit = 8): SupplierActivity[] {
  const ids = myProductIds(submissions, b2bId);
  const events: SupplierActivity[] = [];

  for (const o of orders) {
    const mine = o.items.filter((it) => ids.has(it.productId));
    if (mine.length === 0) continue;
    const itemNames = mine.map((it) => it.name).join(", ");

    events.push({ key: `${o.id}-placed`, text: `New order received — ${itemNames} (Order #${o.id})`, time: o.createdAt });

    if (o.status === "Payment Rejected") {
      events.push({ key: `${o.id}-rejected`, text: `Order #${o.id} cancelled — payment was rejected`, time: o.approvedAt ?? o.createdAt });
    } else if (o.approvedAt) {
      events.push({ key: `${o.id}-approved`, text: `Payment received for Order #${o.id}`, time: o.approvedAt });
    }

    if (o.deliveredAt) {
      events.push({ key: `${o.id}-delivered`, text: `Order #${o.id} delivered to customer`, time: o.deliveredAt });
    }

    if (o.refunded) {
      for (const r of o.refundedItems) {
        if (!ids.has(r.productId)) continue;
        events.push({
          key: `${o.id}-refund-${r.refundId}`,
          text: `Refund issued for ${r.name} (Order #${o.id})`,
          time: o.deliveredAt ?? o.approvedAt ?? o.createdAt,
        });
      }
    }
  }

  return events.sort((a, b) => b.time - a.time).slice(0, limit);
}
