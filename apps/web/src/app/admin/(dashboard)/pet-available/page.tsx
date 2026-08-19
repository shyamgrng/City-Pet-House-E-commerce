"use client";

import { useState } from "react";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { petAvailableCategories, petAvailablePosts, petAvailableSummary } from "@/lib/admin-data";

export default function PetAvailablePage() {
  const [tab, setTab] = useState("Overview");

  return (
    <div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1">Pet Available</div>
      <div className="text-xs text-[#5B6773] mb-4">Manage the puppies, kittens &amp; other pets shown in Pets Available for Sale.</div>

      <div className="flex gap-2 mb-5">
        {["Overview", "Manage Pets"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
            style={{ background: tab === t ? "#1996C8" : "#fff", color: tab === t ? "#fff" : "#3A4652", border: tab === t ? "none" : "1px solid #E4E9EC" }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Manage Pets" ? (
        <div className="bg-white border border-dashed border-[#E4E9EC] rounded-[10px] p-8 text-center text-xs text-[#8A96A3]">
          Manage Pets — coming soon
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-4">
            <Stat label="Total Pets Listed" value={petAvailableSummary.total} />
            <Stat label="Available" value={petAvailableSummary.available} />
            <Stat label="Reserved" value={petAvailableSummary.reserved} />
            <Stat label="Sold" value={petAvailableSummary.sold} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-6">
            {petAvailableCategories.map((c) => (
              <div key={c.label} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 text-center">
                <div className="text-xs text-[#8A96A3] mb-1">{c.label}</div>
                <div className="font-heading font-bold text-xl" style={{ color: c.color }}>
                  {c.count}
                </div>
              </div>
            ))}
          </div>

          <div className="text-[13px] font-bold text-[#1A2027] mb-3">All Pet Posts</div>
          {petAvailableCategories.map((c) => (
            <div key={c.label} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                <span className="text-[13px] font-bold text-[#1A2027]">
                  {c.label} ({c.count})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {petAvailablePosts[c.label].map((p) => (
                  <div key={p.name} className="border-t-2 rounded-[10px] border border-[#E4E9EC] overflow-hidden" style={{ borderTopColor: c.color }}>
                    <div className="h-[100px] relative">
                      <ImagePlaceholder label="photo" className="absolute inset-0 w-full h-full" />
                      <div className="absolute top-1.5 left-1.5 bg-[#1F7A4D] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                        Available
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="font-bold text-sm text-[#1A2027]">{p.name}</div>
                      <div className="text-xs text-[#8A96A3] mb-2.5">{p.info}</div>
                      <div className="flex gap-2">
                        <button className="flex-1 border border-[#E4E9EC] text-[#3A4652] text-xs font-semibold py-2 rounded-md cursor-pointer">
                          Edit
                        </button>
                        <button className="flex-1 bg-primary text-white text-xs font-semibold py-2 rounded-md cursor-pointer">Mark Sold</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
      <div className="text-[11px] text-[#8A96A3] font-semibold mb-2">{label}</div>
      <div className="font-heading font-bold text-xl text-[#1A2027]">{value}</div>
    </div>
  );
}
