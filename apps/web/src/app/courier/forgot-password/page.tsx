"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCourierAuth } from "@/context/CourierAuthContext";

export default function CourierForgotPasswordPage() {
  const router = useRouter();
  const { requestPasswordReset, resetPassword } = useCourierAuth();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [courierId, setCourierId] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submitRequest = () => {
    setError("");
    if (!courierId.trim()) {
      setError("Please enter your Courier ID.");
      return;
    }
    const res = requestPasswordReset(courierId.trim());
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSent(true);
    setStep("reset");
  };

  const submitReset = () => {
    setError("");
    if (!code.trim() || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const res = resetPassword(courierId.trim(), code.trim(), newPassword);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/courier/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA]">
      <div className="w-[340px] bg-white border border-[#E4E9EC] rounded-2xl p-[30px]">
        <div className="font-heading font-bold text-sm mb-1 flex items-center gap-2 text-[#1A2027]">
          <Image src="/assets/cph-logo.jpeg" alt="" width={24} height={24} className="rounded-md object-cover" />
          Reset Courier Password
        </div>
        <div className="text-xs text-[#8A96A3] mb-[22px]">
          {step === "request" ? "Enter your Courier ID and we'll email you a reset code." : "Enter the code we emailed you and choose a new password."}
        </div>

        {step === "request" && (
          <>
            <Label>Courier ID</Label>
            <Input value={courierId} onChange={setCourierId} placeholder="e.g. CR-1001" />
          </>
        )}

        {step === "reset" && (
          <>
            {sent && <div className="text-xs text-[#1F7A4D] bg-[#EAF6EE] rounded-lg px-3.5 py-2.5 mb-3.5">✓ A 6-digit code has been emailed to your address on file.</div>}
            <Label>Reset Code</Label>
            <Input value={code} onChange={setCode} placeholder="123456" />
            <Label>New Password</Label>
            <Input value={newPassword} onChange={setNewPassword} type="password" />
            <Label>Confirm New Password</Label>
            <Input value={confirmPassword} onChange={setConfirmPassword} type="password" mb="mb-5" />
          </>
        )}

        {error && <div className="text-xs text-[#D64545] mb-3.5">{error}</div>}

        <button
          onClick={step === "request" ? submitRequest : submitReset}
          className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer mb-3.5"
        >
          {step === "request" ? "Send Reset Code" : "Reset Password"}
        </button>

        <Link href="/courier/login" className="text-xs text-primary font-semibold block text-center">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">{children}</div>;
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  mb = "mb-3",
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  mb?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] ${mb} box-border`}
    />
  );
}
