import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";

interface BlogPostDetail {
  id: string;
  title: string;
  content: string;
  author: string | null;
  isDoctorPost: boolean;
  photo: string | null;
  publishedAt: string;
}

async function getPost(slug: string) {
  try {
    return await apiFetch<BlogPostDetail>(`/blog-posts/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const date = new Date(post.publishedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link href="/blog" className="mb-4 inline-block text-[13px] font-semibold text-primary">
        ← Back to Blog
      </Link>

      <p className="mb-2 text-[12px] text-text-muted">
        {post.author ? `${post.author} · ` : ""}
        {date}
        {post.isDoctorPost && (
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            From our doctors
          </span>
        )}
      </p>

      <h1 className="mb-5 font-heading text-[24px] font-bold leading-snug text-text-dark">{post.title}</h1>

      <div className="mb-6 h-[280px] overflow-hidden rounded-card bg-bg-surface">
        {post.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.photo} alt={post.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px] text-text-muted">Photo coming soon</div>
        )}
      </div>

      <div className="whitespace-pre-line text-[14px] leading-relaxed text-text-secondary">{post.content}</div>
    </div>
  );
}
