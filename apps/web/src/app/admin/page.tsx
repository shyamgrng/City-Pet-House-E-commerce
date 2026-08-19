"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminIndexPage() {
  const { user, ready } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(user ? "/admin/dashboard" : "/admin/login");
  }, [ready, user, router]);

  return <div className="min-h-screen bg-[#F7F9FA]" />;
}
