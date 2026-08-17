"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";

interface AiSearchResponse {
  configured: boolean;
  productIds: string[];
  note: string;
}

export function ShopSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") ?? searchParams.get("aiQuery") ?? "");
  const [asking, setAsking] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  function pushWith(params: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("search");
    next.delete("aiQuery");
    next.delete("aiIds");
    Object.entries(params).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    router.push(`/shop?${next.toString()}`);
  }

  function runKeywordSearch(e: React.FormEvent) {
    e.preventDefault();
    setAiNote(null);
    pushWith({ search: query.trim() || null });
  }

  async function runAiSearch() {
    const q = query.trim();
    if (!q) return;
    setAsking(true);
    setAiNote(null);
    try {
      const result = await apiFetch<AiSearchResponse>("/products/ai-search", { method: "POST", body: { query: q } });
      if (!result.configured) {
        setAiNote("✨ AI search isn't configured yet — showing keyword results instead.");
        pushWith({ search: q });
        return;
      }
      setAiNote(result.note);
      pushWith({ aiQuery: q, aiIds: result.productIds.join(",") });
    } catch (err) {
      setAiNote(err instanceof ApiError ? err.message : "AI search failed — showing keyword results instead.");
      pushWith({ search: q });
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="mb-4">
      <form onSubmit={runKeywordSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="flex-1 rounded-control border border-border px-4 py-2 text-[13px] outline-none focus:border-primary"
        />
        <button type="submit" className="rounded-control border border-border bg-white px-4 py-2 text-[13px] font-semibold text-text-secondary">
          Search
        </button>
        <button
          type="button"
          onClick={runAiSearch}
          disabled={asking}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-control bg-ai-accent px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
        >
          ✨ {asking ? "Thinking…" : "Ask AI"}
        </button>
      </form>
      {aiNote && <p className="mt-2 text-[12px] text-ai-accent">{aiNote}</p>}
    </div>
  );
}
