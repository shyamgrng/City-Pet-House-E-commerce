"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCourierAuth } from "@/context/CourierAuthContext";

export default function CourierLoginPage() {
  const { courier, ready, signIn } = useCourierAuth();
  const router = useRouter();
  const [courierId, setCourierId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && courier) router.replace("/courier");
  }, [ready, courier, router]);

  const submit = () => {
    const res = signIn(courierId, password);
    if (res.ok) router.replace("/courier");
    else setError(res.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA]">
      <div className="w-[340px] bg-white border border-[#E4E9EC] rounded-2xl p-[30px]">
        <div className="font-heading font-bold text-sm mb-1 flex items-center gap-2 text-[#1A2027]">
          <Image src="/assets/cph-logo.jpeg" alt="" width={24} height={24} className="rounded-md object-cover" />
          Courier Sign In
        </div>
        <div className="text-xs text-[#8A96A3] mb-[22px]">Sign in with your Courier ID and password.</div>

        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">Courier ID</div>
        <input
          value={courierId}
          onChange={(e) => setCourierId(e.target.value)}
          placeholder="e.g. CR-1001"
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
        />
        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">Password</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-1.5 box-border"
        />
        <div className="text-[11px] text-primary font-semibold text-right mb-3">Forgot ID or Password?</div>
        {error && <div className="text-xs text-[#D64545] mb-3">{error}</div>}
        <button onClick={submit} className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer">
          Sign In
        </button>
        <div className="text-center text-[11px] text-[#8A96A3] mt-3.5">
          New courier agent? <span className="text-primary font-semibold">Register here</span>
        </div>
        <div className="text-[10px] text-[#8A96A3] mt-3.5 leading-relaxed">Demo: CR-1001 / courier123</div>
      </div>
    </div>
  );
}
