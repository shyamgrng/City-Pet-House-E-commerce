"use client";

import { useRouter } from "next/navigation";
import BlogArticleEditor from "@/components/blog/BlogArticleEditor";
import { useBlog } from "@/context/BlogContext";

export default function AdminNewBlogArticlePage() {
  const { addPost } = useBlog();
  const router = useRouter();

  return (
    <div className="max-w-[1100px]">
      <BlogArticleEditor
        backLabel="← Blog"
        onBack={() => router.push("/admin/pages/blog")}
        defaultAuthor="City Pet House Team"
        showDoctorToggle
        onPublish={(draft) => {
          addPost(draft);
          router.push("/admin/pages/blog");
        }}
      />
    </div>
  );
}
