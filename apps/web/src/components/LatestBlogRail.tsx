"use client";

import Link from "next/link";
import ImagePlaceholder from "./ImagePlaceholder";
import { useBlog } from "@/context/BlogContext";

export default function LatestBlogRail() {
  const { posts } = useBlog();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 px-8 pb-9">
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.id}`} className="block border border-[#E4E9EC] rounded-[10px] overflow-hidden cursor-pointer">
          <ImagePlaceholder label="blog photo" striped className="h-[100px]" />
          <div className="p-3">
            <div className="text-[11px] text-[#8A96A3] mb-1">{post.date}</div>
            <div className="text-[13px] font-semibold text-[#1A2027] leading-snug">{post.title}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
