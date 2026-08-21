"use client";

import { useState } from "react";
import { courierAccountSeed } from "@/lib/courier-auth-types";
import { useCatalog } from "@/context/CatalogContext";
import { useDelivery } from "@/context/DeliveryContext";
import { useOrder } from "@/context/OrderContext";
import { STATUS_COLORS, type Delivery } from "@/lib/delivery-types";
import { STATUS_COLORS as ORDER_STATUS_COLORS, type Order } from "@/lib/order-types";
import type { RefundRecord } from "@/lib/refund-types";
import MediaSlot from "@/components/MediaSlot";
import ImageUploadField from "@/components/admin/ImageUploadField";

const deliveryTabDefs = [
  { key: "payments", label: "Payment Queue", badgeColor: "#D64545" },
  { key: "orders", label: "Orders", badgeColor: "#D64545" },
  { key: "dispatch", label: "Dispatch", badgeColor: "#D64545" },
  { key: "delivery", label: "Delivery", badgeColor: "#D64545" },
  { key: "cancelled", label: "Cancelled", badgeColor: "#D64545" },
  { key: "rejected", label: "Rejected", badgeColor: "#D64545" },
  { key: "refunds", label: "Refunds", badgeColor: "#D64545" },
  { key: "reports", label: "Reports", badgeColor: "#D64545" },
];

const activityFilters = ["All", "Payment", "Rejected", "Dispatch", "Delivered", "Refund"];
const IN_PROGRESS_STATUSES = ["Dispatched", "Received", "Processing"];

type ActivityEntry = { ts: number; activity: string; order: string; type: string };

function buildActivityLog(orders: Order[], deliveries: Delivery[], refunds: RefundRecord[]): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  for (const o of orders) {
    entries.push({ ts: o.createdAt, activity: `Receipt submitted for review — Rs. ${o.total.toLocaleString("en-IN")}`, order: o.id, type: "Payment" });
    if (o.status === "Payment Approved" || o.status === "On the Way" || o.status === "Delivered") {
      if (o.approvedAt) entries.push({ ts: o.approvedAt, activity: `Payment approved — Rs. ${o.total.toLocaleString("en-IN")}`, order: o.id, type: "Payment" });
    }
    if (o.status === "Payment Rejected") {
      entries.push({ ts: o.createdAt, activity: `Payment rejected — ${o.rejectReason ?? ""}`, order: o.id, type: "Rejected" });
    }
  }
  for (const d of deliveries) {
    if (d.dispatchedAt) entries.push({ ts: d.dispatchedAt, activity: `Forwarded to dispatch — Rs. ${d.amount.toLocaleString("en-IN")}`, order: d.id, type: "Dispatch" });
    if (d.deliveredAt) entries.push({ ts: d.deliveredAt, activity: `Order marked delivered — Rs. ${d.amount.toLocaleString("en-IN")}`, order: d.id, type: "Delivered" });
  }
  for (const r of refunds) {
    entries.push({ ts: r.createdAt, activity: `${r.type} refunded — Rs. ${r.amount.toLocaleString("en-IN")}`, order: r.orderId, type: "Refund" });
  }
  return entries.sort((a, b) => b.ts - a.ts);
}

export default function DeliveriesPage() {
  const [tab, setTab] = useState("payments");
  const [typeFilter, setTypeFilter] = useState("All");
  const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [refundDraftKey, setRefundDraftKey] = useState<{ orderId: string; kind: "item" | "full"; itemIndex?: number } | null>(null);
  const { deliveries, assignCourier, addDelivery } = useDelivery();
  const { orders, refunds, approveOrder, rejectOrder, markOnTheWay, toggleChecklistItem, refundItem, refundWholeOrder } = useOrder();
  const { products, updateProduct } = useCatalog();

  const awaitingCourier = deliveries.filter((d) => d.status === "Awaiting Courier");
  const inProgress = deliveries.filter((d) => IN_PROGRESS_STATUSES.includes(d.status));
  const deliveredLive = deliveries.filter((d) => d.status === "Delivered");
  const cancelledLive = deliveries.filter((d) => d.status === "Cancelled");
  const paymentQueue = orders.filter((o) => o.status === "Receipt Uploaded").sort((a, b) => a.createdAt - b.createdAt);
  const rejectedOrders = orders.filter((o) => o.status === "Payment Rejected").sort((a, b) => b.createdAt - a.createdAt);
  const allOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);

  const liveBadges: Record<string, number> = {
    payments: paymentQueue.length,
    dispatch: awaitingCourier.length,
    delivery: inProgress.length,
    cancelled: cancelledLive.length,
    rejected: rejectedOrders.length,
  };

  const activityLog = buildActivityLog(orders, deliveries, refunds);
  const filteredLog = activityLog.filter((a) => typeFilter === "All" || a.type === typeFilter);

  const deliveryActivityStats = [
    { label: "Pending Payments", value: paymentQueue.length, color: "#C9962B" },
    { label: "Rejected Payments", value: rejectedOrders.length, color: "#D64545" },
    { label: "Awaiting Fulfillment", value: awaitingCourier.length, color: "#1A2027" },
    { label: "On the Way", value: inProgress.length, color: "#1996C8" },
    { label: "Delivered", value: deliveredLive.length, color: "#1F7A4D" },
  ];

  const totalRefunded = refunds.reduce((sum, r) => sum + r.amount, 0);

  const approvedOrders = orders.filter((o) => o.status === "Payment Approved" || o.status === "On the Way" || o.status === "Delivered");
  const revenueByCategory = (() => {
    const byCategory = new Map<string, number>();
    for (const o of approvedOrders) {
      for (const it of o.items) {
        const product = products.find((p) => p.id === it.productId);
        const category = product?.category ?? "Other";
        byCategory.set(category, (byCategory.get(category) ?? 0) + it.price * it.qty);
      }
    }
    const max = Math.max(1, ...byCategory.values());
    return Array.from(byCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, amount]) => ({ label, amount: `Rs. ${amount.toLocaleString("en-IN")}`, pct: `${Math.round((amount / max) * 100)}%` }));
  })();
  const topProducts = (() => {
    const byName = new Map<string, number>();
    for (const o of approvedOrders) {
      for (const it of o.items) byName.set(it.name, (byName.get(it.name) ?? 0) + it.qty);
    }
    return Array.from(byName.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sold]) => ({ name, sold }));
  })();

  const approvePayment = (order: Order) => approveOrder(order.id);

  const forwardToDispatch = (order: Order) => {
    for (const it of order.items) {
      const product = products.find((p) => p.id === it.productId);
      if (!product) continue;
      const newQty = Math.max(0, product.qty - it.qty);
      updateProduct(product.id, { ...product, qty: newQty, outOfStock: newQty === 0 });
    }
    addDelivery({
      id: order.id,
      client: order.ownerName,
      phone: order.ownerPhone,
      address: order.address,
      amount: order.total,
      checklist: order.items.map((it) => `${it.name} ×${it.qty}`),
      status: "Awaiting Courier",
    });
    setSelectedOrderId(null);
  };

  const dispatch = (id: string, courierId: string, courierName: string) => {
    assignCourier(id, courierId, courierName);
    markOnTheWay(id);
  };

  const receiptOrder = orders.find((o) => o.id === receiptOrderId) ?? null;
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;

  const refundDraftOrder = refundDraftKey ? (orders.find((o) => o.id === refundDraftKey.orderId) ?? null) : null;
  const saveRefundDraft = (proofPhoto: string) => {
    if (!refundDraftKey) return;
    if (refundDraftKey.kind === "item" && refundDraftKey.itemIndex !== undefined) {
      refundItem(refundDraftKey.orderId, refundDraftKey.itemIndex, proofPhoto);
    } else {
      refundWholeOrder(refundDraftKey.orderId, proofPhoto);
    }
    setRefundDraftKey(null);
  };

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {deliveryTabDefs.map((t) => {
          const active = tab === t.key;
          const badge = liveBadges[t.key] ?? 0;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              style={{ background: active ? "#1996C8" : "#fff", color: active ? "#fff" : "#3A4652", border: active ? "none" : "1px solid #E4E9EC" }}
            >
              <span>{t.label}</span>
              {badge > 0 && (
                <span
                  className="min-w-[17px] h-[17px] px-1.5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ background: t.badgeColor }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "payments" && (
        <Section title="Payment Queue" subtitle="Receipts awaiting verification — approve to move to Orders for packing">
          {paymentQueue.length === 0 ? (
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-6 text-center text-xs text-[#8A96A3]">No receipts awaiting review</div>
          ) : (
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
              {paymentQueue.map((o) => (
                <PaymentQueueRow key={o.id} order={o} onApprove={approvePayment} onReject={rejectOrder} onViewReceipt={() => setReceiptOrderId(o.id)} />
              ))}
            </div>
          )}
        </Section>
      )}

      {tab === "orders" && (
        <Section title="Orders">
          <Table headers={["Order", "Client", "Date", "Amount", "Status"]}>
            {allOrders.length === 0 ? (
              <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No orders placed yet</div>
            ) : (
              allOrders.map((o) => (
                <Row key={o.id} cols={5} onClick={() => setSelectedOrderId(o.id)} testId={`order-row-${o.id}`}>
                  <div className="font-semibold">{o.id}</div>
                  <div>{o.ownerName}</div>
                  <div className="text-[#5B6773]">{new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  <div className="font-semibold">Rs. {o.total.toLocaleString("en-IN")}</div>
                  <div className="font-semibold" style={{ color: o.refunded ? "#D64545" : o.refundedItems.length > 0 ? "#C9962B" : ORDER_STATUS_COLORS[o.status] }}>
                    {o.refunded ? "Refunded" : o.refundedItems.length > 0 ? "Partial Refund" : o.status}
                  </div>
                </Row>
              ))
            )}
          </Table>
        </Section>
      )}

      {tab === "dispatch" && (
        <Section title="Dispatch Board" subtitle="Approved orders awaiting courier handoff">
          {awaitingCourier.length === 0 ? (
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-6 text-center text-xs text-[#8A96A3]">
              No orders awaiting courier handoff
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {awaitingCourier.map((o) => (
                <DispatchCard key={o.id} delivery={o} onDispatch={dispatch} />
              ))}
            </div>
          )}
        </Section>
      )}

      {tab === "delivery" && (
        <Section title="Delivery" subtitle="Dispatched orders — confirm once handed to the customer">
          <div className="text-[13px] font-bold text-[#1A2027] mb-2 mt-2">In Progress</div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] divide-y divide-[#F0F2F4] mb-5">
            {inProgress.length === 0 ? (
              <div className="px-4 py-4 text-xs text-[#8A96A3] text-center">Nothing in progress</div>
            ) : (
              inProgress.map((o) => (
                <div key={o.id} className="flex justify-between px-4 py-3 text-xs">
                  <div>
                    <span className="font-bold">{o.id}</span> · {o.client} · {o.courierName}
                  </div>
                  <div className="font-semibold" style={{ color: STATUS_COLORS[o.status] }}>
                    {o.status}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-[13px] font-bold text-[#1A2027] mb-2">Delivered</div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] divide-y divide-[#F0F2F4]">
            {deliveredLive.length === 0 ? (
              <div className="px-4 py-4 text-xs text-[#8A96A3] text-center">No deliveries completed yet</div>
            ) : (
              deliveredLive.map((o) => (
                <div key={o.id} className="flex justify-between px-4 py-3 text-xs">
                  <div>
                    <span className="font-bold">{o.id}</span> · {o.client}
                  </div>
                  <div className="text-[#8A96A3]">{o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</div>
                </div>
              ))
            )}
          </div>
        </Section>
      )}

      {tab === "cancelled" && (
        <Section title="Cancelled Deliveries" subtitle="Deliveries cancelled by Admin or a courier, with reason">
          {cancelledLive.length === 0 ? (
            <EmptyRow show />
          ) : (
            <Table headers={["Order", "Client", "Courier", "Reason"]}>
              {cancelledLive.map((o) => (
                <Row key={o.id} cols={4}>
                  <div className="font-semibold">{o.id}</div>
                  <div>{o.client}</div>
                  <div>{o.courierName ?? "—"}</div>
                  <div className="text-[#D64545]">{o.cancelReason}</div>
                </Row>
              ))}
            </Table>
          )}
        </Section>
      )}

      {tab === "rejected" && (
        <Section title="Rejected Payments" subtitle="Receipts declined by admin">
          {rejectedOrders.length === 0 ? (
            <EmptyRow show />
          ) : (
            <Table headers={["Order", "Client", "Amount", "Reason"]}>
              {rejectedOrders.map((r) => (
                <Row key={r.id} cols={4}>
                  <div className="font-semibold">{r.id}</div>
                  <div>{r.ownerName}</div>
                  <div className="font-semibold">Rs. {r.total.toLocaleString("en-IN")}</div>
                  <div className="text-[#D64545]">{r.rejectReason}</div>
                </Row>
              ))}
            </Table>
          )}
        </Section>
      )}

      {tab === "refunds" && (
        <Section title="Refunds" subtitle="Full-order and item-level refunds processed">
          {refunds.length === 0 ? (
            <EmptyRow show />
          ) : (
            <Table headers={["Refund", "Order", "Client", "Type", "Amount", "Date"]}>
              {refunds.map((r) => (
                <Row key={r.id} cols={6}>
                  <div className="font-semibold">{r.id}</div>
                  <div>{r.orderId}</div>
                  <div>{r.clientName}</div>
                  <div className="text-[#5B6773]">{r.type}</div>
                  <div className="font-semibold text-[#D64545]">-Rs. {r.amount.toLocaleString("en-IN")}</div>
                  <div className="text-[#8A96A3]">{new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                </Row>
              ))}
            </Table>
          )}
        </Section>
      )}

      {tab === "reports" && (
        <Section title="Reports">
          <div className="text-[13px] font-bold text-[#1A2027] mb-3">Delivery Activity</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-4">
            {deliveryActivityStats.map((s) => (
              <div key={s.label} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
                <div className="text-[11px] text-[#8A96A3] font-semibold mb-2">{s.label}</div>
                <div className="font-heading font-bold text-xl" style={{ color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-[18px] flex justify-between items-center mb-4">
            <div>
              <div className="text-[13px] font-bold text-[#1A2027]">Total Refunds Issued</div>
              <div className="text-[11px] text-[#8A96A3]">{refunds.length} refund{refunds.length === 1 ? "" : "s"} — deducted from gross revenue</div>
            </div>
            <div className="text-sm font-bold text-[#D64545]">-Rs. {totalRefunded.toLocaleString("en-IN")}</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-4">
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-[18px]">
              <div className="text-[13px] font-bold text-[#1A2027] mb-3">Revenue by Category</div>
              {revenueByCategory.length === 0 ? (
                <div className="text-xs text-[#8A96A3]">No approved orders yet</div>
              ) : (
                revenueByCategory.map((r) => (
                  <div key={r.label} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#1A2027] font-medium">{r.label}</span>
                      <span className="font-semibold">{r.amount}</span>
                    </div>
                    <div className="h-1.5 bg-[#EEF1F3] rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: r.pct }} />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-[18px]">
              <div className="text-[13px] font-bold text-[#1A2027] mb-3">Top Selling Products</div>
              {topProducts.length === 0 ? (
                <div className="text-xs text-[#8A96A3]">No approved orders yet</div>
              ) : (
                topProducts.map((p) => (
                  <div key={p.name} className="flex justify-between py-1.5 border-b border-[#F0F2F4] text-xs last:border-0">
                    <span className="text-[#1A2027]">{p.name}</span>
                    <span className="font-bold">{p.sold} sold</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-[13px] font-bold text-[#1A2027] mb-2">Activity Log</div>
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {activityFilters.map((f) => (
              <FilterPill key={f} active={typeFilter === f} onClick={() => setTypeFilter(f)}>
                {f}
              </FilterPill>
            ))}
          </div>
          <Table headers={["Date", "Time", "Activity", "Order"]}>
            {filteredLog.length === 0 ? (
              <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No activity yet</div>
            ) : (
              filteredLog.map((a, i) => (
                <Row key={i} cols={4}>
                  <div className="text-[#5B6773]">{new Date(a.ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  <div className="text-[#5B6773]">{new Date(a.ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</div>
                  <div>{a.activity}</div>
                  <div className="font-bold">{a.order}</div>
                </Row>
              ))
            )}
          </Table>
        </Section>
      )}

      {receiptOrder && (
        <PaymentReceiptModal
          order={receiptOrder}
          onClose={() => setReceiptOrderId(null)}
          onApprove={() => {
            approvePayment(receiptOrder);
            setReceiptOrderId(null);
          }}
          onReject={(reason) => {
            rejectOrder(receiptOrder.id, reason);
            setReceiptOrderId(null);
          }}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          products={products}
          alreadyForwarded={deliveries.some((d) => d.id === selectedOrder.id)}
          onClose={() => setSelectedOrderId(null)}
          onToggleChecklist={(index) => toggleChecklistItem(selectedOrder.id, index)}
          onForward={() => forwardToDispatch(selectedOrder)}
          onOpenItemRefund={(itemIndex) => setRefundDraftKey({ orderId: selectedOrder.id, kind: "item", itemIndex })}
          onOpenWholeRefund={() => setRefundDraftKey({ orderId: selectedOrder.id, kind: "full" })}
        />
      )}

      {refundDraftOrder && refundDraftKey && (
        <RefundDraftModal
          order={refundDraftOrder}
          draftKey={refundDraftKey}
          onClose={() => setRefundDraftKey(null)}
          onSave={saveRefundDraft}
        />
      )}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1">{title}</div>
      {subtitle && <div className="text-xs text-[#5B6773] mb-[18px]">{subtitle}</div>}
      {children}
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
      <div
        className="grid px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]"
        style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}
      >
        {headers.map((h) => (
          <div key={h}>{h}</div>
        ))}
      </div>
      {children}
    </div>
  );
}

function Row({ cols, children, onClick, testId }: { cols: number; children: React.ReactNode; onClick?: () => void; testId?: string }) {
  return (
    <div
      onClick={onClick}
      data-testid={testId}
      className={`grid px-4 py-3.5 text-xs text-[#1A2027] items-center border-b border-[#F0F2F4] last:border-0 ${onClick ? "cursor-pointer" : ""}`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {children}
    </div>
  );
}

function ActionBtn({ children, color, subtle, onClick, disabled }: { children: React.ReactNode; color: string; subtle?: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      style={subtle ? { background: "#FCEAEA", color } : { background: color, color: "#fff" }}
    >
      {children}
    </button>
  );
}

function EmptyRow({ show }: { show: boolean }) {
  if (!show) return null;
  return <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-6 text-center text-xs text-[#8A96A3]">Nothing here yet</div>;
}

function PaymentQueueRow({
  order,
  onApprove,
  onReject,
  onViewReceipt,
}: {
  order: Order;
  onApprove: (order: Order) => void;
  onReject: (id: string, reason: string) => void;
  onViewReceipt: () => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const fmtTime = (ts: number) => new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div data-testid={`payment-row-${order.id}`} className="border-b border-[#F0F2F4] last:border-0 px-4 py-3.5">
      <div className="grid grid-cols-6 items-center text-xs">
        <div className="font-semibold">{order.id}</div>
        <div>{order.ownerName}</div>
        <div className="font-semibold">Rs. {order.total.toLocaleString("en-IN")}</div>
        <div className="text-[11px] text-[#5B6773]">{fmtTime(order.createdAt)}</div>
        <button onClick={onViewReceipt} className="w-9 h-9 rounded-md overflow-hidden border border-[#E4E9EC] cursor-pointer relative">
          <MediaSlot src={order.receiptPhoto} label="receipt" className="absolute inset-0 w-full h-full" />
        </button>
        <div className="flex gap-2">
          <ActionBtn color="#1F7A4D" onClick={() => onApprove(order)}>
            Approve
          </ActionBtn>
          <ActionBtn color="#D64545" subtle onClick={() => setRejecting((v) => !v)}>
            Reject
          </ActionBtn>
        </div>
      </div>
      {rejecting && (
        <div className="mt-3 flex gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection"
            className="flex-1 px-2.5 py-2 rounded-lg border border-[#E4E9EC] text-xs box-border"
          />
          <button
            onClick={() => {
              if (!reason.trim()) return;
              onReject(order.id, reason.trim());
              setRejecting(false);
              setReason("");
            }}
            disabled={!reason.trim()}
            className="bg-[#D64545] text-white px-3.5 py-2 rounded-md text-[11px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Reject
          </button>
        </div>
      )}
    </div>
  );
}

function DispatchCard({ delivery, onDispatch }: { delivery: Delivery; onDispatch: (id: string, courierId: string, courierName: string) => void }) {
  const [courierId, setCourierId] = useState("");

  const dispatch = () => {
    const courier = courierAccountSeed.find((c) => c.courierId === courierId);
    if (!courier) return;
    onDispatch(delivery.id, courier.courierId, courier.companyName);
  };

  return (
    <div data-testid={`dispatch-card-${delivery.id}`} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="font-bold text-sm text-[#1A2027]">{delivery.id}</div>
        <span className="bg-[#E7F3EC] text-[#1F7A4D] text-[10px] font-bold px-2 py-0.5 rounded">Paid</span>
      </div>
      <div className="text-[13px] font-semibold text-[#1A2027]">{delivery.client}</div>
      <div className="text-xs text-[#5B6773] mt-1">📞 {delivery.phone}</div>
      <div className="text-xs text-[#5B6773] mt-0.5">📍 {delivery.address}</div>
      <div className="text-[10px] text-[#8A96A3] font-bold uppercase mt-3 mb-1">Order Checklist</div>
      {delivery.checklist.map((c) => (
        <div key={c} className="text-xs text-[#3A4652] py-0.5">
          ☑ {c}
        </div>
      ))}
      <div className="flex justify-between text-xs text-[#8A96A3] mt-3 pt-3 border-t border-[#F0F2F4]">
        <span>Amount</span>
        <span className="font-bold text-sm text-[#1A2027]">Rs. {delivery.amount.toLocaleString("en-IN")}</span>
      </div>
      <select
        value={courierId}
        onChange={(e) => setCourierId(e.target.value)}
        className="w-full mt-3 border border-[#E4E9EC] rounded-md px-3 py-2 text-xs text-[#5B6773]"
      >
        <option value="">Select courier…</option>
        {courierAccountSeed.map((c) => (
          <option key={c.courierId} value={c.courierId}>
            {c.companyName}
          </option>
        ))}
      </select>
      <button
        onClick={dispatch}
        disabled={!courierId}
        className="w-full mt-2 bg-primary text-white rounded-md py-2.5 text-[13px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Mark Dispatched
      </button>
    </div>
  );
}

function PaymentReceiptModal({
  order,
  onClose,
  onApprove,
  onReject,
}: {
  order: Order;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const fmtTime = (ts: number) => new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[420px] max-h-[88vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[15px] font-bold text-[#1A2027]">Payment Receipt — {order.id}</div>
          <div onClick={onClose} className="text-base text-[#8A96A3] cursor-pointer">✕</div>
        </div>

        <div className="h-[280px] mb-4 rounded-lg overflow-hidden bg-[#F7F9FA] border border-dashed border-[#C7CDD3] flex items-center justify-center">
          {order.receiptPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={order.receiptPhoto} alt="payment receipt" className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-[#8A96A3]">No screenshot uploaded</span>
          )}
        </div>

        <div className="text-[13px] text-[#1A2027] mb-1">
          {order.ownerName} · Rs. {order.total.toLocaleString("en-IN")}
        </div>
        <div className="text-xs text-[#8A96A3] mb-4">Submitted {fmtTime(order.createdAt)}</div>

        {!rejecting ? (
          <div className="flex gap-2.5">
            <button onClick={onApprove} className="flex-1 text-center bg-[#1F7A4D] text-white py-3 rounded-[9px] text-[13px] font-semibold cursor-pointer">
              Approve
            </button>
            <button
              onClick={() => setRejecting(true)}
              className="bg-[#FCEAEA] text-[#D64545] px-[18px] py-3 rounded-[9px] text-[13px] font-semibold cursor-pointer"
            >
              Reject
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection"
              className="flex-1 px-2.5 py-2 rounded-lg border border-[#E4E9EC] text-xs box-border"
            />
            <button
              onClick={() => reason.trim() && onReject(reason.trim())}
              disabled={!reason.trim()}
              className="bg-[#D64545] text-white px-3.5 py-2 rounded-md text-[11px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
      style={{ background: active ? "#1996C8" : "#F0F2F4", color: active ? "#fff" : "#5B6773" }}
    >
      {children}
    </button>
  );
}

function OrderDetailModal({
  order,
  products,
  alreadyForwarded,
  onClose,
  onToggleChecklist,
  onForward,
  onOpenItemRefund,
  onOpenWholeRefund,
}: {
  order: Order;
  products: import("@/lib/catalog-types").Product[];
  alreadyForwarded: boolean;
  onClose: () => void;
  onToggleChecklist: (index: number) => void;
  onForward: () => void;
  onOpenItemRefund: (itemIndex: number) => void;
  onOpenWholeRefund: () => void;
}) {
  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const allChecked = order.checklist.every((c) => c.checked);
  const itemAvailable = (productId: string) => products.find((p) => p.id === productId)?.outOfStock !== true;
  const allAvailable = order.items.every((it) => itemAvailable(it.productId));
  const canForward = allChecked && allAvailable && order.status === "Payment Approved" && !alreadyForwarded;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[420px] max-h-[88vh] overflow-auto">
        <div className="flex justify-between items-center mb-1">
          <div className="text-base font-bold text-[#1A2027]">{order.id}</div>
          <div onClick={onClose} className="text-base text-[#8A96A3] cursor-pointer">✕</div>
        </div>
        <div className="text-xs text-[#8A96A3] mb-4">{fmtDate(order.createdAt)}</div>

        <div className="text-[11px] font-bold text-[#8A96A3] uppercase mb-1.5">Client Details</div>
        <div className="text-[13px] font-semibold text-[#1A2027] mb-0.5">{order.ownerName}</div>
        <div className="text-xs text-[#5B6773] mb-0.5">📞 {order.ownerPhone}</div>
        <div className="text-xs text-[#5B6773] mb-3.5">📍 {order.address}</div>

        <div className="flex justify-between items-center py-2.5 border-t border-b border-[#EEF1F3] mb-3.5">
          <div className="text-xs text-[#5B6773]">Payment</div>
          <div className="text-xs font-semibold" style={{ color: ORDER_STATUS_COLORS[order.status] }}>
            {order.status}
          </div>
        </div>

        <div className="text-[11px] font-bold text-[#8A96A3] uppercase mb-2">Product List</div>
        {order.items.map((it, i) => (
          <div key={i} className="flex justify-between items-center py-1.5 text-xs">
            <div className="text-[#3A4652]">{it.name}</div>
            <div className="flex items-center gap-2">
              {!itemAvailable(it.productId) && (
                <div className="text-[10px] font-semibold text-[#D64545] bg-[#FDEDEC] px-1.5 py-0.5 rounded">Out of Stock</div>
              )}
              <div className="font-semibold text-[#1A2027]">Rs. {(it.price * it.qty).toLocaleString("en-IN")}</div>
              {order.status === "Payment Approved" && !order.refunded && (
                <div onClick={() => onOpenItemRefund(i)} className="text-[11px] font-semibold text-[#D64545] cursor-pointer">
                  Send for Refund
                </div>
              )}
            </div>
          </div>
        ))}

        {order.refundedItems.length > 0 && (
          <>
            <div className="text-[11px] font-bold text-[#8A96A3] uppercase mt-2.5 mb-1.5">Refunded</div>
            {order.refundedItems.map((ri, i) => (
              <div key={i} className="flex justify-between items-center py-1 text-xs">
                <div className="text-[#8A96A3] line-through">{ri.name}</div>
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-[#D64545] line-through">Rs. {ri.price.toLocaleString("en-IN")}</div>
                  <div className="text-[10px] font-semibold text-[#D64545] bg-[#FDEDEC] px-1.5 py-0.5 rounded">Refunded</div>
                </div>
              </div>
            ))}
          </>
        )}

        <div className="text-[11px] font-bold text-[#8A96A3] uppercase mt-3.5 mb-2">Order Checklist</div>
        {order.checklist.map((c, i) => (
          <div key={i} onClick={() => onToggleChecklist(i)} className="flex items-center gap-2 py-1 cursor-pointer">
            <div
              className="w-4 h-4 rounded border-2 border-primary flex items-center justify-center shrink-0"
              style={{ background: c.checked ? "#EAF4F9" : "#fff" }}
            >
              {c.checked && <span className="text-primary text-[11px] font-bold">✓</span>}
            </div>
            <div className="text-xs text-[#3A4652]">{c.text}</div>
          </div>
        ))}

        <div className="flex justify-between items-center py-3 mt-2.5 border-t border-[#EEF1F3]">
          <div className="text-xs text-[#8A96A3]">Total</div>
          <div className="text-sm font-bold text-[#1A2027]">Rs. {order.total.toLocaleString("en-IN")}</div>
        </div>

        {order.refunded ? (
          <div className="bg-[#FDEDEC] text-[#D64545] text-center py-2.5 rounded-lg text-[13px] font-bold mt-2">Refund Processed</div>
        ) : alreadyForwarded ? (
          <div className="bg-[#EAF6EE] text-[#1F7A4D] text-center py-2.5 rounded-lg text-xs font-semibold mt-2">
            ✓ Forwarded to Dispatch — awaiting courier assignment
          </div>
        ) : order.status !== "Payment Approved" ? null : canForward ? (
          <button onClick={onForward} className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer mt-2">
            Forward to Dispatch
          </button>
        ) : (
          <>
            <div className="bg-[#F0F2F4] text-[#8A96A3] text-center py-2.5 rounded-lg text-xs font-semibold mt-2">
              Complete checklist &amp; confirm stock to forward
            </div>
            <button
              onClick={onOpenWholeRefund}
              className="w-full bg-white border border-[#D64545] text-[#D64545] text-center py-2 rounded-lg text-xs font-semibold cursor-pointer mt-2"
            >
              Refund Whole Order
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function RefundDraftModal({
  order,
  draftKey,
  onClose,
  onSave,
}: {
  order: Order;
  draftKey: { orderId: string; kind: "item" | "full"; itemIndex?: number };
  onClose: () => void;
  onSave: (proofPhoto: string) => void;
}) {
  const [approved, setApproved] = useState(false);
  const [proofPhoto, setProofPhoto] = useState("");

  const item = draftKey.kind === "item" && draftKey.itemIndex !== undefined ? order.items[draftKey.itemIndex] : null;
  const label = item ? item.name : `Full order — ${order.items.map((i) => i.name).join(", ")}`;
  const amount = item ? item.price * item.qty : order.total;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-[22px] w-[380px]">
        <div className="flex justify-between items-center mb-1">
          <div className="text-[15px] font-bold text-[#1A2027]">Process Refund</div>
          <div onClick={onClose} className="text-base text-[#8A96A3] cursor-pointer">✕</div>
        </div>
        <div className="text-xs text-[#8A96A3] mb-4">
          {order.id} · {order.ownerName}
        </div>

        <div className="text-[11px] font-bold text-[#8A96A3] uppercase mb-1.5">Review</div>
        <div className="flex justify-between py-2.5 border-t border-b border-[#EEF1F3] mb-4">
          <div className="text-[13px] text-[#3A4652]">{label}</div>
          <div className="text-[13px] font-bold text-[#1A2027]">Rs. {amount.toLocaleString("en-IN")}</div>
        </div>

        <div onClick={() => setApproved((v) => !v)} className="flex items-center gap-2 mb-4 cursor-pointer">
          <div
            className="w-4 h-4 rounded border-2 border-primary flex items-center justify-center shrink-0"
            style={{ background: approved ? "#EAF4F9" : "#fff" }}
          >
            {approved && <span className="text-primary text-[11px] font-bold">✓</span>}
          </div>
          <div className="text-xs text-[#3A4652]">I have reviewed the items and approved this refund for payment</div>
        </div>

        <div className="text-[11px] font-bold text-[#8A96A3] uppercase mb-2">Upload Payment Screenshot</div>
        <div className="mb-4">
          <ImageUploadField value={proofPhoto} onChange={setProofPhoto} label="refund payment proof" height="h-[140px]" maxWidth={1000} maxHeight={1400} />
        </div>

        {approved ? (
          <button onClick={() => onSave(proofPhoto)} className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer">
            Save Refund Record
          </button>
        ) : (
          <div className="bg-[#F0F2F4] text-[#8A96A3] text-center py-2.5 rounded-lg text-xs font-semibold">Approve the refund to save</div>
        )}
      </div>
    </div>
  );
}
