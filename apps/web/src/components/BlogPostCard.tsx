import Link from "next/link";

export interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  author: string | null;
  photo: string | null;
  publishedAt: string;
}

export function BlogPostCard({ post }: { post: BlogPostData }) {
  const date = new Date(post.publishedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-card border border-border bg-white transition hover:shadow-floating">
      <div className="flex h-24 items-center justify-center bg-bg-surface text-[11px] text-text-muted">
        {post.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.photo} alt={post.title} className="h-full w-full object-cover" />
        ) : (
          "Photo coming soon"
        )}
      </div>
      <div className="p-4">
        <p className="mb-1 text-[11px] text-text-muted">
          {post.author ? `${post.author} · ` : ""}
          {date}
        </p>
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-text-dark">{post.title}</p>
        {post.excerpt && <p className="mt-2 line-clamp-2 text-[12px] text-text-secondary">{post.excerpt}</p>}
      </div>
    </Link>
  );
}
