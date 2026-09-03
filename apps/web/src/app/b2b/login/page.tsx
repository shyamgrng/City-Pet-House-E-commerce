"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useB2BAuth } from "@/context/B2BAuthContext";

export default function B2BLoginPage() {
  const { supplier, ready, signIn } = useB2BAuth();
  const router = useRouter();
  const [b2bId, setB2bId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && supplier) router.replace("/b2b");
  }, [ready, supplier, router]);

  const submit = () => {
    const res = signIn(b2bId, password);
    if (res.ok) router.replace("/b2b");
    else setError(res.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA]">
      <div className="w-[340px] bg-white border border-[#E4E9EC] rounded-2xl p-[30px]">
        <div className="font-heading font-bold text-sm mb-1 flex items-center gap-2 text-[#1A2027]">
          <Image src="/assets/cph-logo.jpeg" alt="" width={24} height={24} className="rounded-md object-cover" />
          B2B Supplier Sign In
        </div>
        <div className="text-xs text-[#8A96A3] mb-[22px]">Sign in with your B2B ID and password.</div>

        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">B2B ID</div>
        <input
          value={b2bId}
          onChange={(e) => setB2bId(e.target.value)}
          placeholder="e.g. B2B-1001"
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
        <Link href="/b2b/forgot-password" className="block text-[11px] text-primary font-semibold text-right mb-3">
          Forgot ID or Password?
        </Link>
        {error && <div className="text-xs text-[#D64545] mb-3">{error}</div>}
        <button onClick={submit} className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer">
          Sign In
        </button>
        <div className="text-center text-[11px] text-[#8A96A3] mt-3.5">
          New B2B supplier?{" "}
          <Link href="/b2b/register" className="text-primary font-semibold">
            Register here
          </Link>
        </div>
        <div className="text-[10px] text-[#8A96A3] mt-3.5 leading-relaxed">Demo: B2B-1001 / supplier123</div>
      </div>
    </div>
  );
}
