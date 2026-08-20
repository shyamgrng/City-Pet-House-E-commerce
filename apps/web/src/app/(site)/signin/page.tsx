"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Sex } from "@/lib/auth-types";

function SigninInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [sex, setSex] = useState<Sex>("Male");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [address, setAddress] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const redirectTo = searchParams.get("redirect") || "/account";

  const submit = () => {
    setError("");
    if (mode === "signin") {
      const res = signIn(email, password);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(redirectTo);
      return;
    }
    if (!name.trim() || !dob.trim() || !phone.trim() || !regEmail.trim() || !address.trim() || !regPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (regPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const res = signUp({ name, sex, dob, phone, email: regEmail, address, password: regPassword });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push(redirectTo);
  };

  return (
    <div className="py-[60px] px-8 flex justify-center">
      <div className="w-full max-w-[400px] border border-[#E4E9EC] rounded-[14px] p-8">
        <div className="flex gap-1.5 bg-[#F0F2F4] rounded-[9px] p-1 mb-6">
          {(["signin", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className="flex-1 text-center py-2.5 rounded-[7px] text-[13px] font-semibold cursor-pointer"
              style={{ background: mode === m ? "#1996C8" : "#fff", color: mode === m ? "#fff" : "#5B6773" }}
            >
              {m === "signin" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {mode === "signin" && (
          <>
            <Label>Email ID</Label>
            <Input value={email} onChange={setEmail} placeholder="you@example.com" />
            <Label>Password</Label>
            <Input value={password} onChange={setPassword} type="password" />
            <div className="text-xs text-primary font-semibold text-right mb-5">Forgot Password?</div>
          </>
        )}

        {mode === "register" && (
          <>
            <Label required>Full Name</Label>
            <Input value={name} onChange={setName} placeholder="Your full name" />

            <Label required>Sex</Label>
            <div className="flex gap-2 mb-3.5">
              {(["Male", "Female", "Other"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  className="flex-1 py-2.5 px-3 rounded-lg text-xs cursor-pointer"
                  style={{ border: `1px solid ${sex === s ? "#1996C8" : "#E4E9EC"}`, color: "#3A4652" }}
                >
                  {s}
                </button>
              ))}
            </div>

            <Label required>Date of Birth</Label>
            <Input value={dob} onChange={setDob} type="date" />
            <Label required>Phone Number</Label>
            <Input value={phone} onChange={setPhone} placeholder="+977 98XXXXXXXX" />
            <Label required>Email Address</Label>
            <Input value={regEmail} onChange={setRegEmail} placeholder="you@example.com" />
            <Label required>Address</Label>
            <Input value={address} onChange={setAddress} placeholder="e.g. Boudha, Gokarneshwor-6, Kathmandu" />
            <Label required>Password</Label>
            <Input value={regPassword} onChange={setRegPassword} type="password" />
            <Label required>Confirm Password</Label>
            <Input value={confirmPassword} onChange={setConfirmPassword} type="password" mb="mb-5" />
          </>
        )}

        {error && <div className="text-xs text-[#D64545] mb-3.5">{error}</div>}

        <button
          onClick={submit}
          className="w-full bg-primary text-white text-center py-3 rounded-[9px] text-sm font-semibold cursor-pointer"
        >
          {mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={null}>
      <SigninInner />
    </Suspense>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div className="text-xs font-semibold text-[#3A4652] mb-1.5">
      {children} {required && <span className="text-[#D64545]">*</span>}
    </div>
  );
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
