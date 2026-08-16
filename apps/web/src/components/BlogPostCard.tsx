export interface BlogPostData {
  id: string;
  title: string;
  excerpt: string | null;
  author: string | null;
  publishedAt: string;
}

export function BlogPostCard({ post }: { post: BlogPostData }) {
  const date = new Date(post.publishedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="overflow-hidden rounded-card border border-border bg-white">
      <div className="flex h-24 items-center justify-center bg-bg-surface text-[11px] text-text-muted">
        Photo coming soon
      </div>
      <div className="p-4">
        <p className="mb-1 text-[11px] text-text-muted">{date}</p>
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-text-dark">{post.title}</p>
        {post.excerpt && <p className="mt-2 line-clamp-2 text-[12px] text-text-secondary">{post.excerpt}</p>}
      </div>
    </div>
  );
}
