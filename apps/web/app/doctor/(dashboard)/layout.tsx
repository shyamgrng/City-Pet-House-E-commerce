"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDoctorAuth, ApiError, DoctorUser } from "@/context/DoctorAuthContext";
import { apiFetch } from "@/lib/api";

export default function DoctorDashboardLayout({ children }: { children: ReactNode }) {
  const { doctor, accessToken, loading, logout, setDoctor } = useDoctorAuth();
  const router = useRouter();
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !doctor) {
      router.replace("/doctor/login");
    }
  }, [loading, doctor, router]);

  if (loading || !doctor) return null;

  async function toggleOnline() {
    setToggling(true);
    setError(null);
    try {
      const updated = await apiFetch<DoctorUser>("/doctor/me/online", {
        method: "PATCH",
        accessToken,
        body: { online: !doctor!.isOnline },
      });
      setDoctor(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update your status.");
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
        <div>
          <p className="font-heading text-[15px] font-bold text-text-dark">City Pet House</p>
          <p className="text-[12px] text-text-muted">Doctor Portal — {doctor.displayName}</p>
        </div>
        <div className="flex items-center gap-4">
          {error && <p className="text-[12px] text-error">{error}</p>}
          <button
            onClick={toggleOnline}
            disabled={toggling}
            className="flex items-center gap-2 rounded-control border border-border px-3 py-2 text-[12px] font-semibold disabled:opacity-60"
          >
            <span className={doctor.isOnline ? "text-success" : "text-text-muted"}>
              {doctor.isOnline ? "Online" : "Offline"}
            </span>
            <span
              className={`relative inline-block h-[22px] w-[38px] rounded-full transition-colors ${
                doctor.isOnline ? "bg-success" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-all ${
                  doctor.isOnline ? "left-[18px]" : "left-0.5"
                }`}
              />
            </span>
          </button>
          <button
            onClick={() => logout().then(() => router.push("/doctor/login"))}
            className="text-[12px] font-medium text-error hover:underline"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
