"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { apiFetch } from "@/lib/api";

interface AdoptionPost {
  id: string;
  name: string;
  breed: string;
  age: string;
  sex: string;
  vaccinationStatus: string | null;
  address: string;
  description: string;
  contact: string;
  status: string;
  createdAt: string;
  postedBy: {
    name: string;
    user: { email: string; phone: string | null };
  };
}

const POST_LIFETIME_DAYS = 15;

function daysLeft(createdAt: string) {
  const posted = new Date(createdAt).getTime();
  const elapsed = (Date.now() - posted) / (24 * 60 * 60 * 1000);
  return Math.max(0, Math.ceil(POST_LIFETIME_DAYS - elapsed));
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  ADOPTED: "bg-primary/10 text-primary",
  REMOVED: "bg-error/10 text-error",
};

export default function AdminAdoptionPage() {
  const { accessToken } = useAdminAuth();
  const [posts, setPosts] = useState<AdoptionPost[] | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "ADOPTED" | "REMOVED">("ALL");

  const load = useCallback(async () => {
    if (!accessToken) return;
    setPosts(await apiFetch<AdoptionPost[]>("/admin/adoption-posts", { accessToken }));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: string) {
    await apiFetch(`/admin/adoption-posts/${id}/status`, { method: "PATCH", accessToken, body: { status } });
    await load();
  }

  const visible = posts?.filter((p) => filter === "ALL" || p.status === filter) ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px]">Adoption Posts</h1>
          <p className="mt-1 text-[13px] text-text-muted">
            Owner-submitted listings. Posts auto-expire from the public site {POST_LIFETIME_DAYS} days after posting.
          </p>
        </div>
        <div className="flex gap-1">
          {(["ALL", "ACTIVE", "ADOPTED", "REMOVED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-control px-3 py-1.5 text-[12px] font-semibold ${
                filter === f ? "bg-primary text-white" : "border border-border text-text-secondary"
              }`}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {!posts ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="py-16 text-center text-[14px] text-text-muted">No adoption posts in this filter.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((post) => (
            <div key={post.id} className="rounded-card border border-border bg-white p-5">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-text-dark">{post.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[post.status] ?? ""}`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-text-muted">
                    {post.breed} &middot; {post.sex} &middot; {post.age}
                    {post.vaccinationStatus ? ` · ${post.vaccinationStatus}` : ""}
                  </p>
                </div>
                {post.status === "ACTIVE" && (
                  <p className="text-[11px] text-text-muted">{daysLeft(post.createdAt)} days left on site</p>
                )}
              </div>

              <p className="mb-3 text-[13px] text-text-secondary">{post.description}</p>

              <div className="mb-3 grid grid-cols-2 gap-2 rounded-control bg-bg-surface p-3 text-[12px] text-text-secondary sm:grid-cols-4">
                <div>
                  <p className="text-text-muted">Location</p>
                  <p className="font-medium text-text-dark">{post.address}</p>
                </div>
                <div>
                  <p className="text-text-muted">Contact</p>
                  <p className="font-medium text-text-dark">{post.contact}</p>
                </div>
                <div>
                  <p className="text-text-muted">Posted by</p>
                  <p className="font-medium text-text-dark">{post.postedBy.name}</p>
                </div>
                <div>
                  <p className="text-text-muted">Owner email</p>
                  <p className="font-medium text-text-dark">{post.postedBy.user.email}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {post.status !== "ACTIVE" && (
                  <button
                    onClick={() => setStatus(post.id, "ACTIVE")}
                    className="rounded-control border border-border px-3 py-1.5 text-[12px] font-semibold text-text-secondary"
                  >
                    Restore to Active
                  </button>
                )}
                {post.status !== "ADOPTED" && (
                  <button
                    onClick={() => setStatus(post.id, "ADOPTED")}
                    className="rounded-control border border-primary px-3 py-1.5 text-[12px] font-semibold text-primary"
                  >
                    Mark Adopted
                  </button>
                )}
                {post.status !== "REMOVED" && (
                  <button
                    onClick={() => setStatus(post.id, "REMOVED")}
                    className="rounded-control border border-error px-3 py-1.5 text-[12px] font-semibold text-error"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
