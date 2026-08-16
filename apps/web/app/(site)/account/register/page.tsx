"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, ApiError } from "@/context/AuthContext";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account/orders";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, phone, password);
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-1 text-[22px]">Create Your Account</h1>
      <p className="mb-6 text-[13px] text-text-secondary">
        Needed to check out, book vet consults, and manage orders.
      </p>

      <form onSubmit={submit} className="flex flex-col gap-3">
        {[
          { label: "Full name", value: name, set: setName, type: "text" },
          { label: "Email", value: email, set: setEmail, type: "email" },
          { label: "Phone", value: phone, set: setPhone, type: "tel" },
          { label: "Password", value: password, set: setPassword, type: "password" },
        ].map((f) => (
          <div key={f.label} className="flex flex-col gap-1">
            <label className="text-[12px] text-text-secondary">{f.label}</label>
            <input
              type={f.type}
              required
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
        ))}
        {error && <p className="text-[12px] text-error">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-control bg-primary px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-[13px] text-text-secondary">
        Already have an account?{" "}
        <Link href={`/account/signin?next=${encodeURIComponent(next)}`} className="font-semibold text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}
