"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DeliveredTab from "@/components/courier/DeliveredTab";
import DeliveriesTab from "@/components/courier/DeliveriesTab";
import EarningsTab from "@/components/courier/EarningsTab";
import ProfileTab from "@/components/courier/ProfileTab";
import { useCourierAuth } from "@/context/CourierAuthContext";
import { useDelivery } from "@/context/DeliveryContext";

const TABS = ["Overview", "Deliveries", "Delivered", "Earnings", "Profile"] as const;
type Tab = (typeof TABS)[number];

const ACTIVE_STATUSES = ["Dispatched", "Received", "Processing"];

export default function CourierPortalPage() {
  const { courier, ready, signOut } = useCourierAuth();
  const { deliveries } = useDelivery();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => {
    if (ready && !courier) router.replace("/courier/login");
  }, [ready, courier, router]);

  if (!ready || !courier) return null;

  const mine = deliveries.filter((d) => d.courierId === courier.courierId);
  const active = mine.filter((d) => ACTIVE_STATUSES.includes(d.status));
  const delivered = mine.filter((d) => d.status === "Delivered");
  const cancelled = mine.filter((d) => d.status === "Cancelled");
  const totalReceivable = mine.filter((d) => d.status !== "Cancelled").reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      <div className="bg-white border-b border-[#E4E9EC] px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/assets/cph-logo.jpeg" alt="" width={28} height={28} className="rounded-md object-cover" />
          <span className="font-heading font-bold text-sm text-[#1A2027]">CPH Courier Portal</span>
        </div>
        <button
          onClick={() => {
            signOut();
            router.push("/courier/login");
          }}
          className="text-xs font-semibold text-[#D64545] cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      <div className="px-8 py-7 max-w-[900px]">
        <div className="flex gap-2 flex-wrap mb-[22px]">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2.5 rounded-full text-xs font-semibold cursor-pointer border border-[#E4E9EC] flex items-center gap-1.5"
              style={{ background: tab === t ? "#1996C8" : "#fff", color: tab === t ? "#fff" : "#3A4652" }}
            >
              <span>{t}</span>
              {t === "Deliveries" && active.length > 0 && (
                <span className="min-w-[16px] h-4 px-1 rounded-full bg-[#D64545] text-white text-[10px] font-bold flex items-center justify-center">
                  {active.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <>
            <div className="font-heading font-bold text-lg text-[#1A2027] mb-1">Welcome, {courier.companyName}</div>
            <div className="text-[13px] text-[#8A96A3] mb-5">Courier ID: {courier.courierId}</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
              <Stat label="Received Deliveries" value={mine.filter((d) => d.status !== "Awaiting Courier").length} color="#1A2027" />
              <Stat label="Active Assigned" value={active.length} color="#1996C8" />
              <Stat label="Delivered" value={delivered.length} color="#1F7A4D" />
              <Stat label="Total Order Value" value={`Rs. ${totalReceivable.toLocaleString("en-IN")}`} color="#7A56C8" />
            </div>

            <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Recent Assignments</div>
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
              {mine.length === 0 ? (
                <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">
                  No deliveries assigned yet — Admin will assign orders to you from the Dispatch board
                </div>
              ) : (
                mine.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex justify-between items-center px-4 py-3 border-b border-[#F0F2F4] last:border-0">
                    <div className="text-[13px] font-semibold text-[#1A2027]">
                      {d.id} — {d.client}
                    </div>
                    <div className="text-[11px] font-bold text-[#5B6773]">{d.status}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {tab === "Deliveries" && <DeliveriesTab courierId={courier.courierId} />}
        {tab === "Delivered" && <DeliveredTab deliveries={[...delivered, ...cancelled].sort((a, b) => (b.deliveredAt ?? 0) - (a.deliveredAt ?? 0))} />}
        {tab === "Earnings" && <EarningsTab deliveries={mine} />}
        {tab === "Profile" && <ProfileTab />}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="border border-[#E4E9EC] rounded-xl p-4">
      <div className="text-[11px] text-[#8A96A3] mb-1.5">{label}</div>
      <div className="font-heading font-bold text-xl" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
