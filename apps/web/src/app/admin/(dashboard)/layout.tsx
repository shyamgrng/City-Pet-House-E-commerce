"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/admin/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA]" />;
  }

  return (
    <div className="min-h-screen flex bg-[#F7F9FA]">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-6 px-7">{children}</div>
    </div>
  );
}
