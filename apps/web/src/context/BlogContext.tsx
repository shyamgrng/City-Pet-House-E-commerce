"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { blogSeed } from "@/lib/blog-seed";
import type { BlogPost } from "@/lib/blog-types";
import { slugify } from "@/lib/blog-types";

const STORAGE_KEY = "cph_blog_posts";

type BlogValue = {
  posts: BlogPost[];
  ready: boolean;
  addPost: (input: Omit<BlogPost, "id">) => void;
  updatePost: (id: string, input: Omit<BlogPost, "id">) => void;
  deletePost: (id: string) => void;
};

const BlogContext = createContext<BlogValue | null>(null);

function loadStored(): BlogPost[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BlogPost[]) : blogSeed;
  } catch {
    return blogSeed;
  }
}

export function BlogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ posts: BlogPost[]; ready: boolean }>({ posts: blogSeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ posts: loadStored(), ready: true });
  }, []);

  const persist = (posts: BlogPost[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    setState({ posts, ready: true });
  };

  const addPost = (input: Omit<BlogPost, "id">) => {
    const id = slugify(input.title) + "-" + Math.random().toString(36).slice(2, 7);
    persist([{ ...input, id }, ...state.posts]);
  };

  const updatePost = (id: string, input: Omit<BlogPost, "id">) => {
    persist(state.posts.map((p) => (p.id === id ? { ...input, id } : p)));
  };

  const deletePost = (id: string) => {
    persist(state.posts.filter((p) => p.id !== id));
  };

  return <BlogContext.Provider value={{ posts: state.posts, ready: state.ready, addPost, updatePost, deletePost }}>{children}</BlogContext.Provider>;
}

export function useBlog() {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error("useBlog must be used within BlogProvider");
  return ctx;
}
