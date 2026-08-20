"use client";

import { useState } from "react";
import {
  adminOrdersData,
  deliveryActivityLog,
  deliveryActivityStats,
  deliveryTabDefs,
  paymentQueueData,
  refundedOrdersData,
  rejectedPaymentsData,
  revenueByCategory,
  topProducts,
} from "@/lib/admin-data";
import { useDelivery } from "@/context/DeliveryContext";
import { STATUS_COLORS, type Delivery } from "@/lib/delivery-types";
import { courierAccountSeed } from "@/lib/courier-auth-types";

const activityFilters = ["All", "Payment", "Refund", "Rejected", "Dispatch", "Delivered"];
const rangeFilters = ["Today", "Yesterday", "Last 7 days", "All time"];
const IN_PROGRESS_STATUSES = ["Dispatched", "Received", "Processing"];

export default function DeliveriesPage() {
  const [tab, setTab] = useState("payments");
  const [typeFilter, setTypeFilter] = useState("All");
  const [rangeFilter, setRangeFilter] = useState("All time");
  const { deliveries, assignCourier } = useDelivery();

  const filteredLog = deliveryActivityLog.filter((a) => typeFilter === "All" || a.type === typeFilter);

  const awaitingCourier = deliveries.filter((d) => d.status === "Awaiting Courier");
  const inProgress = deliveries.filter((d) => IN_PROGRESS_STATUSES.includes(d.status));
  const deliveredLive = deliveries.filter((d) => d.status === "Delivered");
  const cancelledLive = deliveries.filter((d) => d.status === "Cancelled");

  const liveBadges: Record<string, number> = { dispatch: awaitingCourier.length, delivery: inProgress.length, cancelled: cancelledLive.length };

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {deliveryTabDefs.map((t) => {
          const active = tab === t.key;
          const badge = t.key in liveBadges ? liveBadges[t.key] : t.badge;
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
          <Table headers={["Order", "Customer", "Amount", "Submitted", "Receipt", "Actions"]}>
            {paymentQueueData.map((o) => (
              <Row key={o.id} cols={6}>
                <div className="font-semibold">{o.id}</div>
                <div>{o.customer}</div>
                <div className="font-semibold">{o.amount}</div>
                <div className="text-[11px] text-[#5B6773]">{o.submittedAt}</div>
                <div className="w-9 h-9 border border-dashed border-[#C7CDD3] rounded-md flex items-center justify-center text-[#8A96A3]">
                  📄
                </div>
                <div className="flex gap-2">
                  <ActionBtn color="#1F7A4D">Approve</ActionBtn>
                  <ActionBtn color="#D64545" subtle>
                    Reject
                  </ActionBtn>
                </div>
              </Row>
            ))}
          </Table>
        </Section>
      )}

      {tab === "orders" && (
        <Section title="Orders">
          <Table headers={["Order", "Client", "Date", "Amount", "Status"]}>
            {adminOrdersData.map((o) => (
              <Row key={o.id} cols={5}>
                <div className="font-semibold">{o.id}</div>
                <div>{o.client}</div>
                <div className="text-[#5B6773]">{o.date}</div>
                <div className="font-semibold">{o.amount}</div>
                <div className="font-semibold text-[#1F7A4D]">{o.status}</div>
              </Row>
            ))}
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
                <DispatchCard key={o.id} delivery={o} onDispatch={assignCourier} />
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
          <Table headers={["Order", "Client", "Amount", "Reason"]}>
            {rejectedPaymentsData.map((r) => (
              <Row key={r.id} cols={4}>
                <div className="font-semibold">{r.id}</div>
                <div>{r.client}</div>
                <div className="font-semibold">{r.amount}</div>
                <div className="text-[#D64545]">{r.reason}</div>
              </Row>
            ))}
          </Table>
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
              <div className="text-[13px] font-bold text-[#1A2027]">Avg. Delivery Time</div>
              <div className="text-[11px] text-[#8A96A3]">From payment approval to marked delivered, across the last 30 days</div>
            </div>
            <div className="text-sm font-bold text-primary">Avg. 1.4 days</div>
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
              {revenueByCategory.map((r) => (
                <div key={r.label} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#1A2027] font-medium">{r.label}</span>
                    <span className="font-semibold">{r.amount}</span>
                  </div>
                  <div className="h-1.5 bg-[#EEF1F3] rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: r.pct }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-[18px]">
              <div className="text-[13px] font-bold text-[#1A2027] mb-3">Top Selling Products</div>
              {topProducts.map((p) => (
                <div key={p.name} className="flex justify-between py-1.5 border-b border-[#F0F2F4] text-xs last:border-0">
                  <span className="text-[#1A2027]">{p.name}</span>
                  <span className="font-bold">{p.sold} sold</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[13px] font-bold text-[#1A2027] mb-2">Activity Log</div>
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {activityFilters.map((f) => (
              <FilterPill key={f} active={typeFilter === f} onClick={() => setTypeFilter(f)} dark={false}>
                {f}
              </FilterPill>
            ))}
          </div>
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {rangeFilters.map((r) => (
              <FilterPill key={r} active={rangeFilter === r} onClick={() => setRangeFilter(r)} dark>
                {r}
              </FilterPill>
            ))}
          </div>
          <Table headers={["Date", "Time", "Activity", "Order"]}>
            {filteredLog.map((a, i) => (
              <Row key={i} cols={4}>
                <div className="text-[#5B6773]">{a.date}</div>
                <div className="text-[#5B6773]">{a.time}</div>
                <div>{a.activity}</div>
                <div className="font-bold">{a.order}</div>
              </Row>
            ))}
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

function ActionBtn({ children, color, subtle }: { children: React.ReactNode; color: string; subtle?: boolean }) {
  return (
    <button
      className="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer"
      style={subtle ? { background: "#FCEAEA", color } : { background: color, color: "#fff" }}
    >
      {children}
    </button>
  );
}

function EmptyRow({ show }: { show: boolean }) {
  if (!show) return null;
  return <div className="bg-white border-t border-[#E4E9EC] pt-0" />;
}

function DispatchCard({ delivery, onDispatch }: { delivery: Delivery; onDispatch: (id: string, courierId: string, courierName: string) => void }) {
  const [courierId, setCourierId] = useState("");

  const dispatch = () => {
    const courier = courierAccountSeed.find((c) => c.courierId === courierId);
    if (!courier) return;
    onDispatch(delivery.id, courier.courierId, courier.companyName);
  };

  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
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

function FilterPill({
  children,
  active,
  onClick,
  dark,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  dark: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
      style={{
        background: active ? (dark ? "#1A2027" : "#1996C8") : "#F0F2F4",
        color: active ? "#fff" : "#5B6773",
      }}
    >
      {children}
    </button>
  );
}
