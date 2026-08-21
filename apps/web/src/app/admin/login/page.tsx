"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EmailInput from "@/components/EmailInput";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { isValidEmail } from "@/lib/email-format";

export default function AdminLoginPage() {
  const { user, ready, login } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && user) router.replace("/admin/dashboard");
  }, [ready, user, router]);

  const submit = () => {
    if (!isValidEmail(email)) {
      setError("Enter a valid email like abc@abc.com.");
      return;
    }
    if (login(email, password)) {
      router.replace("/admin/dashboard");
    } else {
      setError("Incorrect email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA]">
      <div className="w-[340px] bg-white border border-[#E4E9EC] rounded-2xl p-[30px]">
        <div className="font-heading font-bold text-sm mb-1 flex items-center gap-2 text-[#1A2027]">
          <Image src="/assets/cph-logo.jpeg" alt="" width={24} height={24} className="rounded-md object-cover" />
          CPH Admin
        </div>
        <div className="text-xs text-[#8A96A3] mb-[22px]">Sign in with your staff email and password.</div>

        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">Email</div>
        <EmailInput value={email} onChange={setEmail} placeholder="you@citypethouse.com" />
        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">Password</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
        />
        {error && <div className="text-xs text-[#D64545] mb-3">{error}</div>}
        <button
          onClick={submit}
          className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer"
        >
          Sign In
        </button>
        <div className="text-[10px] text-[#8A96A3] mt-3.5 leading-relaxed">
          Demo: admin@citypethouse.com / admin123
        </div>
      </div>
    </div>
  );
}
