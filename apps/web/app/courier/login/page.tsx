"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCourierAuth, ApiError } from "@/context/CourierAuthContext";

export default function CourierLoginPage() {
  const { login } = useCourierAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/courier/assignments");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-card border border-border bg-white p-8 shadow-panel">
        <p className="mb-1 font-heading text-[18px] font-bold text-text-dark">City Pet House</p>
        <h1 className="mb-6 text-[15px] text-text-secondary">Courier Sign In</h1>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="courier-email" className="text-[12px] text-text-secondary">Email</label>
            <input
              id="courier-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="courier-password" className="text-[12px] text-text-secondary">Password</label>
            <input
              id="courier-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          {error && <p className="text-[12px] text-error">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-control bg-primary px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-center text-[12px] text-text-secondary">
          New courier partner?{" "}
          <Link href="/courier/register" className="font-semibold text-primary hover:underline">
            Register your company
          </Link>
        </p>
      </div>
    </div>
  );
}
