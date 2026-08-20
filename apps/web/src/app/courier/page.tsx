"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCourierAuth } from "@/context/CourierAuthContext";

export default function CourierPortalPage() {
  const { courier, ready, signOut } = useCourierAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !courier) router.replace("/courier/login");
  }, [ready, courier, router]);

  if (!ready || !courier) return null;

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

      <div className="px-8 py-7 max-w-[700px]">
        <div className="font-heading font-bold text-lg text-[#1A2027] mb-1">Welcome, {courier.companyName}</div>
        <div className="text-[13px] text-[#8A96A3] mb-6">Courier ID: {courier.courierId}</div>

        <div className="border border-dashed border-[#E4E9EC] rounded-xl p-8 text-center text-xs text-[#8A96A3]">
          Full courier dashboard — assigned deliveries, route status &amp; proof of delivery — coming soon.
        </div>
      </div>
    </div>
  );
}
