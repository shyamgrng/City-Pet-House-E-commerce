import { myProductIds } from "./b2b-analytics";
import type { B2BProductSubmission } from "./b2b-types";
import { defaultSupplierChecklist, type Order, type SupplierFulfillment } from "./order-types";

/** This supplier's fulfillment record for one order, or an unsaved default if they haven't touched it yet. */
export function getFulfillment(order: Order, b2bId: string): SupplierFulfillment {
  return (
    order.supplierFulfillments?.find((f) => f.b2bId === b2bId) ?? {
      b2bId,
      checklist: defaultSupplierChecklist(),
    }
  );
}

/** Payment-approved orders containing this supplier's product(s) that they haven't marked sent yet. */
export function ordersNeedingFulfillment(orders: Order[], submissions: B2BProductSubmission[], b2bId: string): Order[] {
  const ids = myProductIds(submissions, b2bId);
  return orders
    .filter((o) => o.status === "Payment Approved" && o.items.some((it) => ids.has(it.productId)))
    .filter((o) => !getFulfillment(o, b2bId).sentAt)
    .sort((a, b) => a.createdAt - b.createdAt);
}

/** Orders this supplier has already marked sent, newest first. */
export function ordersSentBySupplier(orders: Order[], submissions: B2BProductSubmission[], b2bId: string): Order[] {
  const ids = myProductIds(submissions, b2bId);
  return orders
    .filter((o) => o.items.some((it) => ids.has(it.productId)))
    .filter((o) => getFulfillment(o, b2bId).sentAt)
    .sort((a, b) => (getFulfillment(b, b2bId).sentAt ?? 0) - (getFulfillment(a, b2bId).sentAt ?? 0));
}

/** Which B2B account (if any) supplies a given product, for the admin order view. */
export function supplierForProduct(
  submissions: B2BProductSubmission[],
  productId: string,
): { b2bId: string; companyName: string } | null {
  const sub = submissions.find((s) => s.productId === productId);
  return sub ? { b2bId: sub.b2bId, companyName: sub.companyName } : null;
}
