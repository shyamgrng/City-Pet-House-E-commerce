"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, ApiError } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

interface AdoptionPost {
  id: string;
  name: string;
  breed: string;
  age: string;
  sex: string;
  status: "ACTIVE" | "ADOPTED" | "REMOVED";
  contact: string;
  createdAt: string;
}

const STATUS_LABELS: Record<AdoptionPost["status"], { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-success/10 text-success" },
  ADOPTED: { label: "Adopted", className: "bg-primary/10 text-primary" },
  REMOVED: { label: "Removed", className: "bg-text-muted/10 text-text-muted" },
};

export default function AccountAdoptionPostsPage() {
  const { accessToken } = useAuth();
  const [posts, setPosts] = useState<AdoptionPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setPosts(await apiFetch<AdoptionPost[]>("/adoption-posts/mine", { accessToken }));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: AdoptionPost["status"]) {
    setBusyId(id);
    setError(null);
    try {
      await apiFetch(`/adoption-posts/${id}/status`, { method: "PATCH", accessToken, body: { status } });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That action failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (!posts) return <p className="text-[13px] text-text-muted">Loading…</p>;

  if (posts.length === 0) {
    return (
      <p className="text-[13px] text-text-muted">
        You haven&apos;t posted any adoption listings yet.{" "}
        <Link href="/adoption" className="font-semibold text-primary hover:underline">
          Post one now →
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-[12px] text-error">{error}</p>}
      {posts.map((post) => (
        <div key={post.id} className="rounded-card border border-border bg-white p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-text-dark">{post.name}</span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_LABELS[post.status].className}`}>
              {STATUS_LABELS[post.status].label}
            </span>
          </div>
          <p className="mb-2 text-[12px] text-text-secondary">
            {post.breed} &middot; {post.sex} &middot; {post.age}
          </p>
          <p className="mb-3 text-[12px] text-text-muted">Posted {new Date(post.createdAt).toLocaleDateString()}</p>

          {post.status === "ACTIVE" && (
            <div className="flex gap-2">
              <button
                onClick={() => setStatus(post.id, "ADOPTED")}
                disabled={busyId === post.id}
                className="rounded-control bg-primary px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-60"
              >
                Mark Adopted
              </button>
              <button
                onClick={() => setStatus(post.id, "REMOVED")}
                disabled={busyId === post.id}
                className="rounded-control border border-error px-3 py-1.5 text-[12px] font-medium text-error disabled:opacity-60"
              >
                Remove Listing
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
