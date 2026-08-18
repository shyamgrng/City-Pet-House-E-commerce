"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCourierAuth } from "@/context/CourierAuthContext";

export default function CourierDashboardLayout({ children }: { children: ReactNode }) {
  const { courier, loading, logout } = useCourierAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !courier) {
      router.replace("/courier/login");
    }
  }, [loading, courier, router]);

  if (loading || !courier) return null;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
        <div>
          <p className="font-heading text-[15px] font-bold text-text-dark">City Pet House</p>
          <p className="text-[12px] text-text-muted">Courier Portal — {courier.companyName}</p>
        </div>
        <button
          onClick={() => logout().then(() => router.push("/courier/login"))}
          className="text-[12px] font-medium text-error hover:underline"
        >
          Sign Out
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {!courier.verified ? (
          <div className="rounded-card border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-6 text-center">
            <p className="mb-1 text-[15px] font-semibold text-text-dark">Your registration is under review</p>
            <p className="text-[13px] text-text-secondary">
              An admin needs to approve your account before you can receive delivery assignments. You&apos;ll be able
              to sign in and use the portal as soon as your account is verified — no further action is needed from you.
            </p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
