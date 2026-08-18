"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { apiFetch, uploadFile, ApiError } from "@/lib/api";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author: string | null;
  isDoctorPost: boolean;
  photo: string | null;
  status: string;
  publishedAt: string;
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "",
  isDoctorPost: false,
  status: "ACTIVE",
  photo: "",
};

export default function AdminBlogPage() {
  const { accessToken } = useAdminAuth();
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setPosts(await apiFetch<BlogPost[]>("/admin/blog-posts", { accessToken }));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  function startAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function startEdit(p: BlogPost) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt ?? "",
      content: p.content,
      author: p.author ?? "",
      isDoctorPost: p.isDoctorPost,
      status: p.status,
      photo: p.photo ?? "",
    });
    setShowForm(true);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadFile(file);
      setForm((s) => ({ ...s, photo: url }));
    } catch {
      setError("Could not upload the photo — please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = {
        title: form.title,
        slug: form.slug.trim() || undefined,
        excerpt: form.excerpt.trim() || undefined,
        content: form.content,
        author: form.author.trim() || undefined,
        isDoctorPost: form.isDoctorPost,
        status: form.status,
        photo: form.photo || undefined,
      };
      if (editingId) {
        await apiFetch(`/admin/blog-posts/${editingId}`, { method: "PATCH", accessToken, body });
      } else {
        await apiFetch("/admin/blog-posts", { method: "POST", accessToken, body });
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the post.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this blog post?")) return;
    await apiFetch(`/admin/blog-posts/${id}`, { method: "DELETE", accessToken });
    await load();
  }

  async function toggleStatus(p: BlogPost) {
    await apiFetch(`/admin/blog-posts/${p.id}`, {
      method: "PATCH",
      accessToken,
      body: { status: p.status === "ACTIVE" ? "HIDDEN" : "ACTIVE" },
    });
    await load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[22px]">Blog</h1>
        <button onClick={startAdd} className="rounded-control bg-primary px-4 py-2 text-[13px] font-semibold text-white">
          + Add Post
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 grid grid-cols-2 gap-3 rounded-card border border-border bg-white p-5">
          <div className="col-span-2 flex gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-bg-surface">
              {form.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-center text-[11px] text-text-muted">No photo</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="blog-photo" className="text-[12px] text-text-secondary">Article photo</label>
              <input id="blog-photo" type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} className="text-[12px]" />
              {uploading && <span className="text-[11px] text-text-muted">Uploading…</span>}
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="blog-title" className="text-[12px] text-text-secondary">Title</label>
            <input
              id="blog-title"
              required
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="blog-slug" className="text-[12px] text-text-secondary">
              URL slug (optional — auto-generated from title if left blank)
            </label>
            <input
              id="blog-slug"
              placeholder="e.g. new-puppy-checklist"
              value={form.slug}
              onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="blog-author" className="text-[12px] text-text-secondary">Author</label>
            <input
              id="blog-author"
              placeholder="e.g. Dr. Sujata Rai"
              value={form.author}
              onChange={(e) => setForm((s) => ({ ...s, author: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="blog-status" className="text-[12px] text-text-secondary">Visibility</label>
            <select
              id="blog-status"
              value={form.status}
              onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            >
              <option value="ACTIVE">Published (visible on site)</option>
              <option value="HIDDEN">Hidden (draft, not visible)</option>
            </select>
          </div>
          <label className="flex items-center gap-2 self-end pb-2 text-[13px] text-text-secondary">
            <input
              type="checkbox"
              checked={form.isDoctorPost}
              onChange={(e) => setForm((s) => ({ ...s, isDoctorPost: e.target.checked }))}
            />
            Written by one of our doctors
          </label>

          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="blog-excerpt" className="text-[12px] text-text-secondary">Excerpt (shown on cards)</label>
            <input
              id="blog-excerpt"
              value={form.excerpt}
              onChange={(e) => setForm((s) => ({ ...s, excerpt: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="blog-content" className="text-[12px] text-text-secondary">Article content</label>
            <textarea
              id="blog-content"
              required
              rows={8}
              value={form.content}
              onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          {error && <p className="col-span-2 text-[12px] text-error">{error}</p>}
          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="rounded-control bg-primary px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Add Post"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-control border border-border px-4 py-2 text-[13px]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!posts ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-bg-surface text-left text-[12px] text-text-muted">
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-control bg-bg-surface">
                      {p.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[9px] text-text-muted">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-text-dark">{p.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.author ?? "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(p.publishedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(p)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        p.status === "ACTIVE" ? "bg-primary/10 text-primary" : "bg-text-muted/10 text-text-muted"
                      }`}
                    >
                      {p.status === "ACTIVE" ? "Published" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(p)} className="mr-3 text-[12px] font-medium text-primary hover:underline">
                      Edit
                    </button>
                    <button onClick={() => remove(p.id)} className="text-[12px] font-medium text-error hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
