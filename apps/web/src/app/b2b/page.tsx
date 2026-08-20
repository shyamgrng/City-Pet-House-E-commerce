"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useB2BAuth } from "@/context/B2BAuthContext";

export default function B2BPortalPage() {
  const { supplier, ready, signOut } = useB2BAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !supplier) router.replace("/b2b/login");
  }, [ready, supplier, router]);

  if (!ready || !supplier) return null;

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

      <div className="px-8 py-7 max-w-[700px]">
        <div className="font-heading font-bold text-lg text-[#1A2027] mb-1">Welcome, {supplier.companyName}</div>
        <div className="text-[13px] text-[#8A96A3] mb-6">Supplier ID: {supplier.b2bId}</div>

        <div className="border border-dashed border-[#E4E9EC] rounded-xl p-8 text-center text-xs text-[#8A96A3]">
          Full supplier dashboard — product submissions, dispatch tracking &amp; payouts — coming soon.
        </div>
      </div>
    </div>
  );
}
