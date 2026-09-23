"use client";

import { createContext, useContext } from "react";
import { blogSeed } from "@/lib/blog-seed";
import type { BlogPost } from "@/lib/blog-types";
import { slugify } from "@/lib/blog-types";
import { useSiteContentStore } from "@/lib/site-content-store";

const STORAGE_KEY = "cph_blog_posts";

type BlogValue = {
  posts: BlogPost[];
  ready: boolean;
  addPost: (input: Omit<BlogPost, "id">) => void;
  updatePost: (id: string, input: Omit<BlogPost, "id">) => void;
  deletePost: (id: string) => void;
};

const BlogContext = createContext<BlogValue | null>(null);

export function BlogProvider({ children }: { children: React.ReactNode }) {
  const { data: posts, ready, update: persist } = useSiteContentStore<BlogPost[]>(STORAGE_KEY, blogSeed);

  const addPost = (input: Omit<BlogPost, "id">) => {
    const id = slugify(input.title) + "-" + Math.random().toString(36).slice(2, 7);
    persist([{ ...input, id }, ...posts]);
  };

  const updatePost = (id: string, input: Omit<BlogPost, "id">) => {
    persist(posts.map((p) => (p.id === id ? { ...input, id } : p)));
  };

  const deletePost = (id: string) => {
    persist(posts.filter((p) => p.id !== id));
  };

  return <BlogContext.Provider value={{ posts, ready, addPost, updatePost, deletePost }}>{children}</BlogContext.Provider>;
}

export function useBlog() {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error("useBlog must be used within BlogProvider");
  return ctx;
}
