"use client";

import { useState } from "react";
import { refundedOrdersData } from "@/lib/admin-data";
import { courierAccountSeed } from "@/lib/courier-auth-types";
import { useCatalog } from "@/context/CatalogContext";
import { useDelivery } from "@/context/DeliveryContext";
import { useOrder } from "@/context/OrderContext";
import { STATUS_COLORS, type Delivery } from "@/lib/delivery-types";
import type { Order } from "@/lib/order-types";

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

const activityFilters = ["All", "Payment", "Rejected", "Dispatch", "Delivered"];
const IN_PROGRESS_STATUSES = ["Dispatched", "Received", "Processing"];

type ActivityEntry = { ts: number; activity: string; order: string; type: string };

function buildActivityLog(orders: Order[], deliveries: Delivery[]): ActivityEntry[] {
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
  return entries.sort((a, b) => b.ts - a.ts);
}

export default function DeliveriesPage() {
  const [tab, setTab] = useState("payments");
  const [typeFilter, setTypeFilter] = useState("All");
  const { deliveries, assignCourier, addDelivery } = useDelivery();
  const { orders, approveOrder, rejectOrder, markOnTheWay } = useOrder();
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

  const activityLog = buildActivityLog(orders, deliveries);
  const filteredLog = activityLog.filter((a) => typeFilter === "All" || a.type === typeFilter);

  const deliveryActivityStats = [
    { label: "Pending Payments", value: paymentQueue.length, color: "#C9962B" },
    { label: "Rejected Payments", value: rejectedOrders.length, color: "#D64545" },
    { label: "Awaiting Fulfillment", value: awaitingCourier.length, color: "#1A2027" },
    { label: "On the Way", value: inProgress.length, color: "#1996C8" },
    { label: "Delivered", value: deliveredLive.length, color: "#1F7A4D" },
  ];

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

  const approve = (order: Order) => {
    for (const it of order.items) {
      const product = products.find((p) => p.id === it.productId);
      if (!product) continue;
      const newQty = Math.max(0, product.qty - it.qty);
      updateProduct(product.id, { ...product, qty: newQty, outOfStock: newQty === 0 });
    }
    approveOrder(order.id);
    addDelivery({
      id: order.id,
      client: order.ownerName,
      phone: order.ownerPhone,
      address: order.address,
      amount: order.total,
      checklist: order.items.map((it) => `${it.name} ×${it.qty}`),
      status: "Awaiting Courier",
    });
  };

  const dispatch = (id: string, courierId: string, courierName: string) => {
    assignCourier(id, courierId, courierName);
    markOnTheWay(id);
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
        <Section title="Payment Queue" subtitle="Receipts awaiting verification — approve to commit stock & issue invoice">
          {paymentQueue.length === 0 ? (
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-6 text-center text-xs text-[#8A96A3]">No receipts awaiting review</div>
          ) : (
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
              {paymentQueue.map((o) => (
                <PaymentQueueRow key={o.id} order={o} onApprove={approve} onReject={rejectOrder} />
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
                <Row key={o.id} cols={5}>
                  <div className="font-semibold">{o.id}</div>
                  <div>{o.ownerName}</div>
                  <div className="text-[#5B6773]">{new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  <div className="font-semibold">Rs. {o.total.toLocaleString("en-IN")}</div>
                  <div className="font-semibold text-[#1F7A4D]">{o.status}</div>
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
          <EmptyRow show={refundedOrdersData.length === 0} />
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
              <div className="text-[11px] text-[#8A96A3]">0 refunds — deducted from gross revenue</div>
            </div>
            <div className="text-sm font-bold text-[#D64545]">-Rs. 0</div>
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

function Row({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <div
      className="grid px-4 py-3.5 text-xs text-[#1A2027] items-center border-b border-[#F0F2F4] last:border-0"
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

function PaymentQueueRow({ order, onApprove, onReject }: { order: Order; onApprove: (order: Order) => void; onReject: (id: string, reason: string) => void }) {
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
        <div className="w-9 h-9 border border-dashed border-[#C7CDD3] rounded-md flex items-center justify-center text-[#8A96A3]">📄</div>
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
