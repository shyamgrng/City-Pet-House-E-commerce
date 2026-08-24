"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { localStorageUsedPercent } from "@/lib/storage-usage";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAdminAuth();
  const router = useRouter();
  const [storagePercent, setStoragePercent] = useState(0);

  useEffect(() => {
    if (ready && !user) router.replace("/admin/login");
  }, [ready, user, router]);

  useEffect(() => {
    if (ready && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStoragePercent(localStorageUsedPercent());
    }
  }, [ready, user]);

  if (!ready || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA]" />;
  }

  return (
    <div className="min-h-screen flex bg-[#F7F9FA]">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-6 px-7">
        {storagePercent >= 80 && (
          <div className="bg-[#FDEDEC] border border-[#F3C6C2] text-[#8A2A21] text-xs rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
            <span>⚠️</span>
            <span>
              Storage is {storagePercent}% full ({storagePercent >= 95 ? "uploads and saves will start failing" : "getting close to the limit"}) —
              delete some old pet photos/videos or product images you no longer need to free up space.
            </span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
