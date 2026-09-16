"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStaffAuth } from "@/context/StaffAuthContext";

export default function StaffLoginPage() {
  const { staff, ready, signIn } = useStaffAuth();
  const router = useRouter();
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && staff) router.replace("/staff");
  }, [ready, staff, router]);

  const submit = () => {
    const res = signIn(staffId, password);
    if (res.ok) router.replace("/staff");
    else setError(res.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA]">
      <div className="w-[340px] bg-white border border-[#E4E9EC] rounded-2xl p-[30px]">
        <div className="font-heading font-bold text-sm mb-1 flex items-center gap-2 text-[#1A2027]">
          <Link href="/" className="shrink-0">
            <Image src="/assets/cph-logo.jpeg" alt="" width={24} height={24} className="rounded-md object-cover" />
          </Link>
          Staff Sign In
        </div>
        <div className="text-xs text-[#8A96A3] mb-[22px]">Sign in with the Staff ID and password your admin gave you.</div>

        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">Staff ID</div>
        <input
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          placeholder="e.g. ST-1001"
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
        />
        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">Password</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
        />
        {error && <div className="text-xs text-[#D64545] mb-3">{error}</div>}
        <button onClick={submit} className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer">
          Sign In
        </button>
        <div className="text-[10px] text-[#8A96A3] mt-3.5 leading-relaxed">
          New staff member? Your admin creates your account and sends you your Staff ID and password directly.
        </div>
      </div>
    </div>
  );
}
