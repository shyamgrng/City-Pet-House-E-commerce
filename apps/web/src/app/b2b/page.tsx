"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FinanceTab from "@/components/b2b/FinanceTab";
import IncomingOrdersTab from "@/components/b2b/IncomingOrdersTab";
import ProductsTab from "@/components/b2b/ProductsTab";
import ProfileTab from "@/components/b2b/ProfileTab";
import StatusTab from "@/components/b2b/StatusTab";
import { useB2B } from "@/context/B2BContext";
import { useB2BAuth } from "@/context/B2BAuthContext";
import { useRestock } from "@/context/RestockContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { STATUS_COLORS, listingLabel } from "@/lib/b2b-types";
import { awaitsSupplier } from "@/lib/restock-types";

const TABS = ["Dashboard", "Incoming Orders", "Status", "Products", "Finance", "Profile"] as const;
type Tab = (typeof TABS)[number];

export default function B2BPortalPage() {
  const { supplier, ready, signOut } = useB2BAuth();
  const { submissions } = useB2B();
  const { orders } = useRestock();
  const { settings } = useSiteSettings();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Dashboard");

  useEffect(() => {
    if (ready && !supplier) router.replace("/b2b/login");
  }, [ready, supplier, router]);

  if (!ready || !supplier) return null;

  const mine = submissions.filter((s) => s.b2bId === supplier.b2bId);
  const live = mine.filter((s) => s.status === "Approved");
  const removed = mine.filter((s) => s.status === "Rejected");
  const myOrders = orders.filter((o) => o.b2bId === supplier.b2bId);
  const awaitingResponse = myOrders.filter(awaitsSupplier).length;

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      <div className="bg-[#F7F9FA] border-b border-[#E4E9EC]">
        <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto px-4 md:px-8 py-1.5 text-[11px] text-[#5B6773]">
          <div>📞 {settings.phone}</div>
          <div>📍 {settings.address}</div>
          <div>{settings.hours}</div>
        </div>
      </div>

      <div className="bg-white border-b border-[#E4E9EC]">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4 md:px-8 py-3.5">
          <div className="flex items-center gap-2.5">
            <Image src="/assets/cph-logo.jpeg" alt="" width={34} height={34} className="rounded-md object-contain" />
            <span className="font-heading font-bold text-[15px] text-[#1A2027]">CPH B2B Portal</span>
          </div>
          <button
            onClick={() => {
              signOut();
              router.push("/b2b/login");
            }}
            className="text-[13px] font-semibold text-[#D64545] cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-7">
        <div className="flex gap-2 flex-wrap mb-[22px]">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2.5 rounded-full text-xs font-semibold cursor-pointer border border-[#E4E9EC] flex items-center gap-1.5"
              style={{ background: tab === t ? "#1996C8" : "#fff", color: tab === t ? "#fff" : "#3A4652" }}
            >
              {t}
              {t === "Incoming Orders" && awaitingResponse > 0 && (
                <span
                  className="min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: tab === t ? "#fff" : "#D64545", color: tab === t ? "#1996C8" : "#fff" }}
                >
                  {awaitingResponse}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "Dashboard" && (
          <>
            <div className="font-heading font-bold text-lg text-[#1A2027] mb-1">Welcome, {supplier.companyName}</div>
            <div className="text-[13px] text-[#8A96A3] mb-5">Supplier ID: {supplier.b2bId}</div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-6">
              <Stat label="Total Submitted" value={mine.length} color="#1A2027" />
              <Stat label="Live on Storefront" value={live.length} color="#1F7A4D" />
              <Stat label="Removed" value={removed.length} color="#D64545" />
            </div>

            <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Recent Submissions</div>
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
              {mine.length === 0 ? (
                <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">
                  No submissions yet — head to the Products tab to submit your first product
                </div>
              ) : (
                mine
                  .slice()
                  .sort((a, b) => b.submittedAt - a.submittedAt)
                  .slice(0, 5)
                  .map((s) => (
                    <div key={s.id} className="flex justify-between items-center px-4 py-3 border-b border-[#F0F2F4] last:border-0">
                      <div className="text-[13px] font-semibold text-[#1A2027]">{s.name}</div>
                      <div className="text-[11px] font-bold" style={{ color: STATUS_COLORS[s.status] }}>
                        {listingLabel(s)}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </>
        )}

        {tab === "Incoming Orders" && <IncomingOrdersTab />}

        {tab === "Status" && <StatusTab />}

        {tab === "Products" && <ProductsTab />}
        {tab === "Finance" && <FinanceTab submissions={mine} />}
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
