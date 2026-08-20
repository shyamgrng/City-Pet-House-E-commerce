import Link from "next/link";
import { pageEditorList } from "@/lib/admin-data";

export default function PagesPage() {
  return (
    <div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1">Pages</div>
      <div className="text-xs text-[#5B6773] mb-4">Manage the content, images, and typography of each site page.</div>

      <div className="flex flex-col gap-2.5 max-w-2xl">
        {pageEditorList.map((p) =>
          "href" in p && p.href ? (
            <Link
              key={p.title}
              href={p.href}
              className="bg-white border border-[#E4E9EC] rounded-[10px] px-[18px] py-3.5 flex justify-between items-center gap-4"
            >
              <div>
                <div className="font-bold text-sm text-[#1A2027]">{p.title}</div>
                <div className="text-xs text-[#8A96A3] mt-0.5">{p.desc}</div>
              </div>
              <div className="text-primary text-xs font-semibold shrink-0 cursor-pointer">Edit →</div>
            </Link>
          ) : (
            <div key={p.title} className="bg-white border border-[#E4E9EC] rounded-[10px] px-[18px] py-3.5 flex justify-between items-center gap-4">
              <div>
                <div className="font-bold text-sm text-[#1A2027]">{p.title}</div>
                <div className="text-xs text-[#8A96A3] mt-0.5">{p.desc}</div>
              </div>
              <div className="text-primary text-xs font-semibold shrink-0 cursor-pointer">Edit →</div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
