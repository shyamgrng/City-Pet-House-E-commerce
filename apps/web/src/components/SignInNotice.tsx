"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function SignInNotice() {
  const { user, loading } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (loading || user || dismissed) return null;

  return (
    <div className="mx-auto mt-4 flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-card border border-[#F2C0BC] bg-[#FDEDEC] px-5 py-4">
      <p className="text-[13px] text-[#A32E27]">
        <strong>Please sign in or create your account</strong> to access My Account, bookings, and orders.
      </p>
      <div className="flex shrink-0 items-center gap-2.5">
        <Link href="/account/signin" className="rounded-control bg-primary px-4 py-2 text-[12px] font-semibold text-white hover:opacity-90">
          Sign In / Register
        </Link>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="px-1 text-[16px] text-text-muted hover:text-text-secondary"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
