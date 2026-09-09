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
import { useCatalog } from "@/context/CatalogContext";
import { useOrder } from "@/context/OrderContext";
import { useRestock } from "@/context/RestockContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { amountDue, lowStockCount, ordersReceivedCount, recentActivity, weeklySales } from "@/lib/b2b-analytics";
import { awaitsSupplier } from "@/lib/restock-types";

const TABS = ["Dashboard", "Incoming Orders", "Status", "Products", "Finance", "Profile"] as const;
type Tab = (typeof TABS)[number];

export default function B2BPortalPage() {
  const { supplier, ready, signOut } = useB2BAuth();
  const { submissions } = useB2B();
  const { orders: restockOrders } = useRestock();
  const { orders: customerOrders } = useOrder();
  const { products } = useCatalog();
  const { settings } = useSiteSettings();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Dashboard");

  useEffect(() => {
    if (ready && !supplier) router.replace("/b2b/login");
  }, [ready, supplier, router]);

  if (!ready || !supplier) return null;

  const mine = submissions.filter((s) => s.b2bId === supplier.b2bId);
  const myRestockOrders = restockOrders.filter((o) => o.b2bId === supplier.b2bId);
  const awaitingResponse = myRestockOrders.filter(awaitsSupplier).length;

  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN");
  const salesSeries = weeklySales(customerOrders, submissions, supplier.b2bId);
  const salesPeak = Math.max(1, ...salesSeries.map((d) => d.count));
  const activity = recentActivity(customerOrders, submissions, supplier.b2bId);
  const fmtDateTime = (ts: number) => new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

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
              <Stat label="Orders Received" value={ordersReceivedCount(customerOrders, submissions, supplier.b2bId)} color="#1996C8" />
              <Stat label="Low Stock Level" value={lowStockCount(products, submissions, supplier.b2bId)} color="#C9962B" />
              <Stat label="Amount Due to Collect" value={fmt(amountDue(customerOrders, submissions, supplier.b2bId))} color="#1F7A4D" />
            </div>

            <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-6">
              <div className="text-[13px] font-bold text-[#1A2027] mb-0.5">Your Sales — Last 7 Days</div>
              <div className="text-[11px] text-[#8A96A3] mb-[18px]">
                Net of City Pet House&apos;s commission — this is what feeds the &ldquo;Amount Due&rdquo; total above.
              </div>
              <div className="flex items-end gap-4 h-40 px-1">
                {salesSeries.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="text-[11px] font-bold text-[#1A2027]">{fmt(d.count)}</div>
                    <div
                      className="w-full max-w-[36px] rounded-t-md"
                      style={{ height: `${Math.round((d.count / salesPeak) * 120)}px`, background: i === 6 ? "#1996C8" : "#CFE6F1" }}
                    />
                    <div className="text-[10px] text-[#8A96A3]">{d.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Recent Activity</div>
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6">
              {activity.length === 0 ? (
                <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">
                  No order activity yet — this will show order status, cancellations, refunds, and payments once your products start selling.
                </div>
              ) : (
                activity.map((a) => (
                  <div key={a.key} className="px-4 py-3 border-b border-[#F0F2F4] last:border-0">
                    <div className="text-xs font-semibold text-[#3A4652]">{a.text}</div>
                    <div className="text-[10px] text-[#8A96A3] mt-0.5">{fmtDateTime(a.time)}</div>
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
