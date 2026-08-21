"use client";

import Link from "next/link";
import MediaSlot from "@/components/MediaSlot";
import { useBlog } from "@/context/BlogContext";

export default function BlogPage() {
  const { posts, ready } = useBlog();

  if (!ready) return null;

  return (
    <div className="px-8 py-7">
      <div className="font-heading font-bold text-xl text-[#1A2027] mb-5">Blog</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.id}`} className="block border border-[#E4E9EC] rounded-xl overflow-hidden cursor-pointer">
            <div className="h-[150px] relative">
              <MediaSlot src={post.photo} label="article photo" className="absolute inset-0 w-full h-full" />
            </div>
            <div className="p-4">
              <div className="text-[11px] text-[#8A96A3] mb-1.5">
                {post.author} · {post.date}
              </div>
              <div className="text-sm font-bold text-[#1A2027] leading-snug mb-2">{post.title}</div>
              <div className="text-xs text-[#5B6773] leading-relaxed">{post.excerpt}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
