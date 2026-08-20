"use client";

import { useState } from "react";
import type { BlogPost } from "@/lib/blog-types";

type Draft = Omit<BlogPost, "id">;

const emptyDraft: Draft = {
  title: "",
  date: "",
  author: "City Pet House Team",
  isDoctorPost: false,
  excerpt: "",
  content: "",
};

export default function BlogFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: BlogPost | null;
  onClose: () => void;
  onSave: (draft: Draft) => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial ? { ...initial } : emptyDraft);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const canSave = draft.title.trim().length > 0 && draft.author.trim().length > 0;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[520px] max-h-[88vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[15px] font-bold text-[#1A2027]">{initial ? "Edit Article" : "New Article"}</div>
          <div onClick={onClose} className="text-base text-[#8A96A3] cursor-pointer">✕</div>
        </div>

        <Label>Title *</Label>
        <Input value={draft.title} onChange={(v) => set("title", v)} />

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <Label>Author *</Label>
            <Input value={draft.author} onChange={(v) => set("author", v)} />
          </div>
          <div>
            <Label>Date</Label>
            <Input value={draft.date} onChange={(v) => set("date", v)} placeholder="e.g. Jul 21, 2026" />
          </div>
        </div>

        <div className="flex items-center justify-between py-2.5 border-t border-b border-[#F0F2F4] mb-3.5">
          <span className="text-[13px] text-[#1A2027]">Doctor Post</span>
          <button
            onClick={() => set("isDoctorPost", !draft.isDoctorPost)}
            className="w-10 h-6 rounded-full relative cursor-pointer transition-colors shrink-0"
            style={{ background: draft.isDoctorPost ? "#25D366" : "#D8DCE0" }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all"
              style={{ left: draft.isDoctorPost ? "18px" : "2px" }}
            />
          </button>
        </div>

        <Label>Excerpt (shown on Blog list &amp; Home cards)</Label>
        <Input value={draft.excerpt} onChange={(v) => set("excerpt", v)} />

        <Label>Content (article body paragraph)</Label>
        <textarea
          value={draft.content}
          onChange={(e) => set("content", e.target.value)}
          rows={6}
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-4 box-border resize-y font-sans"
        />

        <button
          disabled={!canSave}
          onClick={() => canSave && onSave(draft)}
          className="w-full bg-primary text-white font-bold text-sm py-3 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {initial ? "Save Changes" : "Publish Article"}
        </button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold text-[#3A4652] mb-1.5">{children}</div>;
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
    />
  );
}
