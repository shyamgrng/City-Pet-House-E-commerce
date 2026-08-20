"use client";

import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { useBlog } from "@/context/BlogContext";
import { useVet } from "@/context/VetContext";

export default function WebVetPage() {
  const { doctors, ready } = useVet();
  const { posts } = useBlog();
  const doctorPosts = posts.filter((p) => p.isDoctorPost).slice(0, 3);

  if (!ready) return null;

  return (
    <div>
      <div className="mx-8 mt-7 mb-6 p-8 rounded-2xl bg-[#EAF4F9] flex items-center justify-between gap-5 flex-wrap">
        <div>
          <div className="font-heading font-bold text-xl text-[#1A2027] mb-1.5">Talk to a Certified Vet</div>
          <div className="text-[13px] text-[#3A4652] max-w-[480px]">
            Book a doctor online now, or schedule a video consult in advance — pick a doctor and a time that works for you.
          </div>
        </div>
        <Link href="/vet/book" className="bg-primary text-white px-6 py-3 rounded-[9px] text-[13px] font-semibold shrink-0">
          Book Now
        </Link>
      </div>

      <div className="px-8 pb-4 font-heading font-bold text-base text-[#1A2027]">Our Doctors</div>
      <div className="px-8 pb-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {doctors.map((doc) => (
          <div key={doc.id} className="border border-[#E4E9EC] rounded-xl overflow-hidden">
            <div
              className="h-[180px] flex items-center justify-center text-[#8A96A3] font-mono text-[9px] relative"
              style={{ backgroundImage: "repeating-linear-gradient(45deg, #EDEFF1, #EDEFF1 8px, #E4E7EA 8px, #E4E7EA 16px)" }}
            >
              doctor photo
              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-white/90 px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: doc.online ? "#1F7A4D" : "#8A96A3" }} />
                <span className="text-[9px] font-semibold text-[#1A2027]">{doc.online ? "Online" : "Offline"}</span>
              </div>
            </div>
            <div className="p-3">
              <div className="flex justify-between items-start gap-2">
                <div className="text-[13px] font-bold text-[#1A2027]">{doc.name}</div>
                {doc.verified && (
                  <div className="text-[9px] font-bold text-[#1F7A4D] bg-[#EAF6EE] px-1.5 py-0.5 rounded-full whitespace-nowrap">✓ Verified</div>
                )}
              </div>
              <div className="text-[11px] text-[#5B6773] my-1">{doc.qualification}</div>
              <div className="text-[10px] text-[#8A96A3] mb-2.5">NVC No: {doc.nvcNumber}</div>
              <Link
                href={`/vet/book?doctor=${doc.id}`}
                className="block bg-primary text-white text-center py-2 rounded-md text-xs font-semibold"
              >
                Book Now
              </Link>
            </div>
          </div>
        ))}
      </div>

      {doctorPosts.length > 0 && (
        <div className="px-8 pb-8">
          <div className="font-heading font-bold text-base text-[#1A2027] mb-4">Blogs by Our Doctors</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px]">
            {doctorPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="block border border-[#E4E9EC] rounded-xl overflow-hidden cursor-pointer">
                <div className="h-[150px] relative">
                  <ImagePlaceholder label="article photo" className="absolute inset-0 w-full h-full" />
                </div>
                <div className="p-4">
                  <div className="text-[11px] text-primary font-semibold mb-1.5">{post.author}</div>
                  <div className="text-sm font-bold text-[#1A2027] leading-snug mb-2">{post.title}</div>
                  <div className="text-xs text-[#5B6773] leading-relaxed">{post.excerpt}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
