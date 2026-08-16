"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { AdoptionPostForm } from "@/components/AdoptionPostForm";

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
  createdAt: string;
}

export default function AdoptionPage() {
  const [posts, setPosts] = useState<AdoptionPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<AdoptionPost[]>("/adoption-posts");
      setPosts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-6 text-[22px]">Dog Adoption</h1>

      <div className="mb-8">
        <AdoptionPostForm onPosted={load} />
      </div>

      {loading ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="py-8 text-center text-[14px] text-text-muted">No adoption notices posted right now.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-card border border-border bg-white p-4">
              <h3 className="text-[15px] font-semibold text-text-dark">{post.name}</h3>
              <p className="text-[12px] text-text-muted">
                {post.breed} &middot; {post.sex} &middot; {post.age}
              </p>
              <p className="mt-2 text-[13px] text-text-secondary">{post.description}</p>
              {post.vaccinationStatus && (
                <p className="mt-2 text-[12px] text-text-secondary">
                  <span className="font-medium text-text-dark">Vaccination:</span> {post.vaccinationStatus}
                </p>
              )}
              <p className="mt-1 text-[12px] text-text-muted">{post.address}</p>
              <a href={`tel:${post.contact}`} className="mt-3 inline-block text-[13px] font-semibold text-primary">
                Contact: {post.contact}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
