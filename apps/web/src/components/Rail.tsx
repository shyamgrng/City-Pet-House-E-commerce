import { ReactNode } from "react";
import Link from "next/link";

export function Rail({ title, viewAllHref, children }: { title: string; viewAllHref?: string; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[20px]">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-[13px] font-medium text-primary hover:underline">
            View all
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{children}</div>
    </section>
  );
}
