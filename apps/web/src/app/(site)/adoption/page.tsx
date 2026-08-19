"use client";

import { useAdoption } from "@/context/AdoptionContext";
import { daysLeft } from "@/lib/adoption-types";

export default function AdoptionPage() {
  const { posts } = useAdoption();

  return (
    <div>
      <div
        className="mx-8 mt-7 mb-6 p-8 rounded-2xl flex items-center justify-between gap-5 flex-wrap"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #EAF4F9, #EAF4F9 10px, #DCEBF3 10px, #DCEBF3 20px)",
        }}
      >
        <div>
          <div className="font-heading font-bold text-xl text-[#1A2027] mb-1.5">Help a Dog Find a Home</div>
          <div className="text-[13px] text-[#3A4652] max-w-[480px]">
            Post an adoption notice for free — your listing stays live for 15 days and can be extended on request.
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 flex gap-7 flex-wrap">
        <div className="flex-[1.4] min-w-[400px]">
          <div className="font-heading font-bold text-base text-[#1A2027] mb-4">Dogs Looking for a Home</div>
          {posts.length === 0 ? (
            <div className="border border-dashed border-[#E4E9EC] rounded-xl p-10 text-center text-xs text-[#8A96A3]">
              No adoption notices right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-[#E4E9EC] rounded-xl overflow-hidden">
                  <div
                    className="h-[120px] flex items-center justify-center text-[#8A96A3] font-mono text-[9px] relative"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, #EDEFF1, #EDEFF1 8px, #E4E7EA 8px, #E4E7EA 16px)",
                    }}
                  >
                    dog photo
                    {post.adopted && (
                      <div
                        className="absolute top-2 right-2 bg-[#1F7A4D] text-white text-[11px] font-bold px-2.5 py-1 rounded-md"
                        style={{ transform: "rotate(-6deg)" }}
                      >
                        ADOPTED
                      </div>
                    )}
                  </div>
                  <div className="p-3.5">
                    <div className="text-sm font-bold text-[#1A2027]">
                      {post.name} · {post.breed}
                    </div>
                    <div className="text-xs text-[#8A96A3] mt-0.5">
                      {post.sex} · {post.age}
                    </div>
                    <div className="text-[11px] text-primary font-semibold mt-1">💉 {post.vaccination}</div>
                    <div className="text-[11px] text-[#8A96A3] mt-0.5">📍 {post.address}</div>
                    <div className="text-xs text-[#5B6773] leading-relaxed my-2">{post.desc}</div>
                    <div className="text-[11px] font-semibold text-[#1F7A4D] bg-[#E6F3EC] inline-block px-2 py-1 rounded-md mb-2.5">
                      {daysLeft(post)} days left on listing
                    </div>
                    <button className="w-full bg-primary text-white text-center py-2 rounded-lg text-xs font-semibold cursor-pointer">
                      Contact Owner
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-[320px] border border-[#E4E9EC] rounded-2xl p-6 h-fit">
          <div className="font-heading font-bold text-base text-[#1A2027] mb-2">Post an Adoption Notice</div>
          <div className="text-[13px] text-[#5B6773] leading-relaxed mb-[18px]">
            You need a free account to post an adoption notice — this helps us verify listings and follow up with you.
          </div>
          <button className="w-full bg-primary text-white text-center py-3 rounded-[9px] text-sm font-semibold cursor-pointer">
            Sign In or Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
