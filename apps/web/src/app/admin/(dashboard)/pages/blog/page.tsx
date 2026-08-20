"use client";

import Link from "next/link";
import { useState } from "react";
import BlogFormModal from "@/components/admin/BlogFormModal";
import { useBlog } from "@/context/BlogContext";
import type { BlogPost } from "@/lib/blog-types";

export default function AdminBlogPage() {
  const { posts, addPost, updatePost, deletePost } = useBlog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);

  const doctorPosts = posts.filter((p) => p.isDoctorPost);
  const adminPosts = posts.filter((p) => !p.isDoctorPost);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p: BlogPost) => {
    setEditing(p);
    setModalOpen(true);
  };
  const handleSave = (draft: Omit<BlogPost, "id">) => {
    if (editing) updatePost(editing.id, draft);
    else addPost(draft);
    setModalOpen(false);
  };

  return (
    <div className="max-w-[1100px]">
      <Link href="/admin/pages" className="text-xs font-semibold text-primary cursor-pointer mb-2.5 inline-block">
        ← Pages
      </Link>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1.5">Blog</div>
      <div className="text-xs text-[#5B6773] mb-[18px]">Click an article to edit its photo, text &amp; SEO.</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="text-[13px] font-bold text-[#1A2027] my-2.5">Doctor Posts</div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
            {doctorPosts.length === 0 ? (
              <div className="px-4 py-4 text-xs text-[#8A96A3] text-center">No doctor posts yet</div>
            ) : (
              doctorPosts.map((post) => (
                <div key={post.id} className="flex justify-between items-center px-4 py-3 border-b border-[#F0F2F4] last:border-0">
                  <div onClick={() => openEdit(post)} className="text-[13px] font-semibold text-[#1A2027] cursor-pointer flex-1">
                    {post.title}
                  </div>
                  <div className="flex gap-3.5 items-center shrink-0 ml-2">
                    <div className="text-[11px] text-[#8A96A3]">{post.date}</div>
                    <div className="text-[11px] text-[#8A96A3]">{post.author}</div>
                    <div onClick={() => openEdit(post)} className="text-xs font-semibold text-primary cursor-pointer">
                      Edit
                    </div>
                    <div onClick={() => deletePost(post.id)} className="text-xs font-semibold text-[#D64545] cursor-pointer">
                      Delete
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="text-[13px] font-bold text-[#1A2027] my-2.5">Admin / Team Posts</div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
            {adminPosts.length === 0 ? (
              <div className="px-4 py-4 text-xs text-[#8A96A3] text-center">No admin/team posts yet</div>
            ) : (
              adminPosts.map((post) => (
                <div key={post.id} className="flex justify-between items-center px-4 py-3 border-b border-[#F0F2F4] last:border-0">
                  <div onClick={() => openEdit(post)} className="text-[13px] font-semibold text-[#1A2027] cursor-pointer flex-1">
                    {post.title}
                  </div>
                  <div className="flex gap-3.5 items-center shrink-0 ml-2">
                    <div className="text-[11px] text-[#8A96A3]">{post.date}</div>
                    <div className="text-[11px] text-[#8A96A3]">{post.author}</div>
                    <div onClick={() => openEdit(post)} className="text-xs font-semibold text-primary cursor-pointer">
                      Edit
                    </div>
                    <div onClick={() => deletePost(post.id)} className="text-xs font-semibold text-[#D64545] cursor-pointer">
                      Delete
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <button
        onClick={openAdd}
        className="border border-dashed border-primary text-primary text-center px-4 py-3 rounded-[10px] text-xs font-semibold cursor-pointer mt-5 max-w-[360px]"
      >
        + Add Article
      </button>

      {modalOpen && <BlogFormModal initial={editing} onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  );
}
