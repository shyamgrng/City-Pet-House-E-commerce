"use client";

import { useState } from "react";
import { useDelivery } from "@/context/DeliveryContext";
import { useOrder } from "@/context/OrderContext";
import { deliveryTimeline, STATUS_COLORS, type Delivery } from "@/lib/delivery-types";

const ACTIVE_STATUSES = ["Dispatched", "Received", "Processing"] as const;

export default function DeliveriesTab({ courierId }: { courierId: string }) {
  const { deliveries, markReceived, assignDeliveryPerson, markDelivered, cancelDelivery } = useDelivery();
  const { markDelivered: markOrderDelivered } = useOrder();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dpName, setDpName] = useState("");
  const [dpPhone, setDpPhone] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const mine = deliveries.filter((d) => d.courierId === courierId && (ACTIVE_STATUSES as readonly string[]).includes(d.status));
  const selected = mine.find((d) => d.id === selectedId) ?? null;

  const openDetail = (d: Delivery) => {
    setSelectedId(d.id);
    setDpName(d.dpName ?? "");
    setDpPhone(d.dpPhone ?? "");
    setCancelling(false);
    setCancelReason("");
  };

  if (selected) {
    const timeline = deliveryTimeline(selected);
    return (
      <div>
        <div onClick={() => setSelectedId(null)} className="text-xs text-primary font-semibold cursor-pointer mb-4">
          ← Back to List
        </div>
        <div className="border border-[#E4E9EC] rounded-xl p-5 max-w-[520px]">
          <div className="text-[15px] font-bold text-[#1A2027] mb-1">
            {selected.id} — {selected.client}
          </div>
          <div className="text-[13px] text-[#8A96A3] mb-5">
            {selected.address} · Rs. {selected.amount.toLocaleString("en-IN")}
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-xs mb-5">
            <div>
              <div className="text-[#8A96A3] mb-0.5">Phone</div>
              <div className="font-semibold text-[#1A2027]">{selected.phone}</div>
            </div>
            <div>
              <div className="text-[#8A96A3] mb-0.5">Status</div>
              <div className="font-semibold" style={{ color: STATUS_COLORS[selected.status] }}>
                {selected.status}
              </div>
            </div>
          </div>

          <div className="text-[11px] font-bold text-[#8A96A3] uppercase mb-2">Items</div>
          {selected.checklist.map((c) => (
            <div key={c} className="text-xs text-[#3A4652] py-0.5">
              ☑ {c}
            </div>
          ))}

          <div className="text-[11px] font-bold text-[#8A96A3] uppercase mt-5 mb-2">Timeline</div>
          {timeline.map((step) => (
            <div key={step.label} className="flex items-center gap-2 py-1 text-xs">
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]" style={{ background: step.done ? "#1F7A4D" : "#E4E9EC", color: step.done ? "#fff" : "#8A96A3" }}>
                {step.done ? "✓" : ""}
              </span>
              <span className={step.done ? "text-[#1A2027] font-semibold" : "text-[#8A96A3]"}>{step.label}</span>
            </div>
          ))}

          <div className="mt-5 flex flex-wrap gap-2">
            {selected.status === "Dispatched" && (
              <button onClick={() => markReceived(selected.id)} className="bg-[#C9962B] text-white px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer">
                Item Received
              </button>
            )}

            {selected.status === "Processing" && (
              <button
                onClick={() => {
                  markDelivered(selected.id);
                  markOrderDelivered(selected.id);
                }}
                className="bg-[#1F7A4D] text-white px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                ✓ Mark Delivered
              </button>
            )}

            {!cancelling && selected.status !== "Delivered" && (
              <button
                onClick={() => setCancelling(true)}
                className="bg-white text-[#D64545] border border-[#F3C9C9] px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel Delivery
              </button>
            )}
          </div>

          {selected.status === "Received" && (
            <div className="mt-4 border-t border-[#F0F2F4] pt-4">
              <div className="text-[13px] font-bold text-[#1A2027] mb-3">Assign Delivery Person</div>
              <input
                value={dpName}
                onChange={(e) => setDpName(e.target.value)}
                placeholder="Delivery person name"
                className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-2.5 box-border"
              />
              <input
                value={dpPhone}
                onChange={(e) => setDpPhone(e.target.value)}
                placeholder="Delivery person phone"
                className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
              />
              <button
                onClick={() => dpName.trim() && dpPhone.trim() && assignDeliveryPerson(selected.id, dpName.trim(), dpPhone.trim())}
                disabled={!dpName.trim() || !dpPhone.trim()}
                className="bg-primary text-white px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Assign &amp; Mark Processed
              </button>
            </div>
          )}

          {cancelling && (
            <div className="mt-4 border-t border-[#F0F2F4] pt-4">
              <div className="text-[13px] font-bold text-[#1A2027] mb-3">Cancel Delivery</div>
              <input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation"
                className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!cancelReason.trim()) return;
                    cancelDelivery(selected.id, cancelReason.trim());
                    setSelectedId(null);
                  }}
                  disabled={!cancelReason.trim()}
                  className="bg-[#D64545] text-white px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm Cancellation
                </button>
                <button onClick={() => setCancelling(false)} className="bg-[#F0F2F4] text-[#5B6773] px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer">
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
      {mine.length === 0 ? (
        <div className="px-4 py-6 text-center text-xs text-[#8A96A3]">No deliveries assigned to you right now</div>
      ) : (
        mine.map((d) => (
          <div key={d.id} onClick={() => openDetail(d)} className="flex justify-between items-center px-4 py-3.5 border-b border-[#F0F2F4] last:border-0 cursor-pointer">
            <div>
              <div className="text-[13px] font-semibold text-[#1A2027]">
                {d.id} — {d.client}
              </div>
              <div className="text-[11px] text-[#8A96A3] mt-0.5">
                {d.address} · Rs. {d.amount.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="text-[11px] font-bold shrink-0 ml-2" style={{ color: STATUS_COLORS[d.status] }}>
              {d.status}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
