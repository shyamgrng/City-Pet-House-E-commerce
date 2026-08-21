"use client";

import { useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { BlogPost } from "@/lib/blog-types";

type Draft = Omit<BlogPost, "id">;

export default function BlogFormModal({
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  initial: BlogPost;
  onClose: () => void;
  onSave: (draft: Draft) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<Draft>({ ...initial });
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[560px] max-h-[88vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[15px] font-bold text-[#1A2027]">Edit Article</div>
          <div onClick={onClose} className="text-base text-[#8A96A3] cursor-pointer">✕</div>
        </div>

        <div className="flex gap-4.5 gap-x-[18px] mb-3.5 flex-col sm:flex-row">
          <div className="w-full sm:w-[150px] shrink-0">
            <ImageUploadField value={draft.photo} onChange={(v) => set("photo", v)} label="article photo" height="h-[110px]" maxWidth={1000} maxHeight={560} />
          </div>
          <div className="flex-1">
            <Label>Title</Label>
            <input
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full box-border h-9 rounded-lg border border-[#E4E9EC] px-3 text-[13px] mb-2.5"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Author</Label>
                <input value={draft.author} onChange={(e) => set("author", e.target.value)} className="w-full box-border h-[34px] rounded-lg border border-[#E4E9EC] px-2.5 text-xs" />
              </div>
              <div>
                <Label>Date</Label>
                <input value={draft.date} onChange={(e) => set("date", e.target.value)} className="w-full box-border h-[34px] rounded-lg border border-[#E4E9EC] px-2.5 text-xs" />
              </div>
            </div>
          </div>
        </div>

        <Label>Slug (URL) — leave blank to auto-generate</Label>
        <input
          value={draft.slug}
          onChange={(e) => set("slug", e.target.value)}
          placeholder="e.g. dog-skin-allergies"
          className="w-full box-border h-[34px] rounded-lg border border-[#E4E9EC] px-2.5 text-xs mb-2.5"
        />

        <Label>Meta Description (SEO)</Label>
        <textarea
          value={draft.metaDescription}
          onChange={(e) => set("metaDescription", e.target.value)}
          placeholder="Leave blank to auto-use the excerpt"
          className="w-full box-border h-[52px] rounded-lg border border-[#E4E9EC] px-2.5 py-2 text-xs mb-2.5 resize-y font-sans"
        />

        <Label>Excerpt (shown on Blog list)</Label>
        <textarea
          value={draft.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          className="w-full box-border h-[52px] rounded-lg border border-[#E4E9EC] px-2.5 py-2 text-xs mb-2.5 resize-y font-sans"
        />

        <Label>Full Article</Label>
        <textarea
          value={draft.content}
          onChange={(e) => set("content", e.target.value)}
          className="w-full box-border h-[140px] rounded-lg border border-[#E4E9EC] px-2.5 py-2 text-xs mb-3.5 resize-y font-sans"
        />

        <div className="flex justify-between items-center">
          <button onClick={onDelete} className="text-xs font-semibold text-[#D64545] cursor-pointer">
            Delete Article
          </button>
          <button onClick={save} className="bg-primary text-white px-[22px] py-[11px] rounded-lg text-[13px] font-semibold cursor-pointer">
            Update Website
          </button>
        </div>
        {saved && <div className="text-xs text-[#1F7A4D] mt-2.5 text-center">✓ Changes are live on the website</div>}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold text-[#8A96A3] mb-1">{children}</div>;
}
