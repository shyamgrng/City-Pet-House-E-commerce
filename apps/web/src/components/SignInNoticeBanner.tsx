"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignInNoticeBanner() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  const show = searchParams.get("notice") === "signin" && !dismissed;

  useEffect(() => {
    if (searchParams.get("notice") !== "signin") return;
    const timer = setTimeout(() => setDismissed(true), 5000);
    return () => clearTimeout(timer);
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="mx-8 mt-4 px-5 py-4 rounded-xl bg-[#FDEDEC] border border-[#F2C0BC] flex justify-between items-center gap-4 flex-wrap">
      <div className="text-[13px] text-[#A32E27]">
        <strong>Please sign in or create your account</strong> to access My Account, bookings, and orders.
      </div>
      <div className="flex gap-2.5 items-center shrink-0">
        <Link href="/signin?redirect=/" className="bg-primary text-white px-[18px] py-2.5 rounded-lg text-xs font-semibold cursor-pointer">
          Sign In / Register
        </Link>
        <button onClick={() => setDismissed(true)} className="text-[#8A96A3] text-base cursor-pointer p-1">
          ✕
        </button>
      </div>
    </div>
  );
}
