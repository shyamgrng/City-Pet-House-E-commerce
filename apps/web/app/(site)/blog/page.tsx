import { apiFetch } from "@/lib/api";
import { BlogPostCard, BlogPostData } from "@/components/BlogPostCard";

async function getBlogPosts() {
  return apiFetch<BlogPostData[]>("/blog-posts").catch(() => []);
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-6 text-[22px]">Blog</h1>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-[14px] text-text-muted">No articles posted yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
