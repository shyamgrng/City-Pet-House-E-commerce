"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EmailInput from "@/components/EmailInput";
import { useAuth } from "@/context/AuthContext";
import { isValidEmail } from "@/lib/email-format";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { requestPasswordReset, resetPassword } = useAuth();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submitRequest = () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your account email.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email like abc@abc.com.");
      return;
    }
    const res = requestPasswordReset(email.trim());
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
    const res = resetPassword(email.trim(), code.trim(), newPassword);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/signin");
  };

  return (
    <div className="py-[60px] px-8 flex justify-center">
      <div className="w-full max-w-[400px] border border-[#E4E9EC] rounded-[14px] p-8">
        <div className="font-heading font-bold text-lg text-[#1A2027] mb-1.5">Forgot Password</div>
        <div className="text-xs text-[#8A96A3] mb-6">
          {step === "request" ? "Enter your account email and we'll send you a reset code." : "Enter the code we emailed you and choose a new password."}
        </div>

        {step === "request" && (
          <>
            <Label>Email ID</Label>
            <EmailInput value={email} onChange={setEmail} className="mb-3.5" />
          </>
        )}

        {step === "reset" && (
          <>
            {sent && <div className="text-xs text-[#1F7A4D] bg-[#EAF6EE] rounded-lg px-3.5 py-2.5 mb-3.5">✓ A 6-digit code has been emailed to {email}.</div>}
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
          className="w-full bg-primary text-white text-center py-3 rounded-[9px] text-sm font-semibold cursor-pointer mb-3.5"
        >
          {step === "request" ? "Send Reset Code" : "Reset Password"}
        </button>

        <Link href="/signin" className="text-xs text-primary font-semibold block text-center">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold text-[#3A4652] mb-1.5">{children}</div>;
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  mb = "mb-3.5",
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
      className={`w-full px-3.5 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] ${mb} box-border`}
    />
  );
}
