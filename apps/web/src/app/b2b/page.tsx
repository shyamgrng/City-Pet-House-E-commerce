"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FinanceTab from "@/components/b2b/FinanceTab";
import ProductsTab from "@/components/b2b/ProductsTab";
import ProfileTab from "@/components/b2b/ProfileTab";
import { useB2B } from "@/context/B2BContext";
import { useB2BAuth } from "@/context/B2BAuthContext";
import { STATUS_COLORS } from "@/lib/b2b-types";

const TABS = ["Dashboard", "Incoming Orders", "Status", "Products", "Finance", "Profile"] as const;
type Tab = (typeof TABS)[number];

export default function B2BPortalPage() {
  const { supplier, ready, signOut } = useB2BAuth();
  const { submissions } = useB2B();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Dashboard");

  useEffect(() => {
    if (ready && !supplier) router.replace("/b2b/login");
  }, [ready, supplier, router]);

  if (!ready || !supplier) return null;

  const mine = submissions.filter((s) => s.b2bId === supplier.b2bId);
  const pending = mine.filter((s) => s.status === "Pending");
  const approved = mine.filter((s) => s.status === "Approved");
  const rejected = mine.filter((s) => s.status === "Rejected");

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      <div className="bg-white border-b border-[#E4E9EC] px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/assets/cph-logo.jpeg" alt="" width={28} height={28} className="rounded-md object-cover" />
          <span className="font-heading font-bold text-sm text-[#1A2027]">CPH B2B Portal</span>
        </div>
        <button
          onClick={() => {
            signOut();
            router.push("/b2b/login");
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
              className="px-4 py-2.5 rounded-full text-xs font-semibold cursor-pointer border border-[#E4E9EC]"
              style={{ background: tab === t ? "#1996C8" : "#fff", color: tab === t ? "#fff" : "#3A4652" }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Dashboard" && (
          <>
            <div className="font-heading font-bold text-lg text-[#1A2027] mb-1">Welcome, {supplier.companyName}</div>
            <div className="text-[13px] text-[#8A96A3] mb-5">Supplier ID: {supplier.b2bId}</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
              <Stat label="Total Submitted" value={mine.length} color="#1A2027" />
              <Stat label="Pending Review" value={pending.length} color="#B8860B" />
              <Stat label="Approved" value={approved.length} color="#1F7A4D" />
              <Stat label="Rejected" value={rejected.length} color="#D64545" />
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
                        {s.status}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </>
        )}

        {tab === "Incoming Orders" && (
          <EmptyState text="No incoming stock orders yet — this will show here once City Pet House places a restock order with you." />
        )}

        {tab === "Status" && (
          <EmptyState text="No shipments in transit — dispatch and delivery status will appear here once you ship stock against an order." />
        )}

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

function EmptyState({ text }: { text: string }) {
  return <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-8 text-center text-xs text-[#8A96A3]">{text}</div>;
}
