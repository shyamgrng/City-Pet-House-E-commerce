"use client";

import { use } from "react";
import Link from "next/link";
import MediaSlot from "@/components/MediaSlot";
import { useBlog } from "@/context/BlogContext";

export default function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { posts, ready } = useBlog();

  if (!ready) return null;

  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="px-8 py-10 text-center text-sm text-[#8A96A3]">
        Article not found. <Link href="/blog" className="text-primary font-semibold">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="px-8 py-7 max-w-[720px]">
      <Link href="/blog" className="text-[13px] text-primary font-semibold mb-4 inline-block">
        ← Back to Blog
      </Link>
      <div className="text-xs text-[#8A96A3] mb-2">
        {post.author} · {post.date}
      </div>
      <div className="font-heading font-bold text-2xl text-[#1A2027] leading-tight mb-[18px]">{post.title}</div>
      <div className="h-[280px] rounded-xl relative overflow-hidden mb-5">
        <MediaSlot src={post.photo} label="article photo" className="absolute inset-0 w-full h-full" />
      </div>
      {/<[a-z][\s\S]*>/i.test(post.content) ? (
        // Written with the rich-text editor -- content is HTML authored by admin/doctor
        // accounts only (never public user input), so rendering it directly is safe here.
        <div className="text-sm text-[#3A4652] leading-loose" dangerouslySetInnerHTML={{ __html: post.content }} />
      ) : (
        // Written with the plain-text "Full Article" field (doctor/admin quick-edit form) --
        // no HTML tags, so preserve line breaks instead of interpreting markup.
        <div className="text-sm text-[#3A4652] leading-loose whitespace-pre-line">{post.content}</div>
      )}
    </div>
  );
}
