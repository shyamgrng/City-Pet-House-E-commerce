"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, ApiError } from "@/context/AuthContext";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account/orders";

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
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-1 text-[22px]">Pet Owner Sign In</h1>
      <p className="mb-6 text-[13px] text-text-secondary">Sign in to check out, book vet consults, and track your orders.</p>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-text-secondary">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-control border border-border px-3 py-2 text-[13px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-text-secondary">Password</label>
          <input
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

      <p className="mt-6 text-[13px] text-text-secondary">
        New here?{" "}
        <Link href={`/account/register?next=${encodeURIComponent(next)}`} className="font-semibold text-primary">
          Create an account
        </Link>
      </p>
    </div>
  );
}
