"use client";

import { useState } from "react";
import { careerApplications, careerFolders } from "@/lib/admin-data";

export default function CareerPage() {
  const [folder, setFolder] = useState("inbox");
  const rows = folder === "inbox" ? careerApplications : [];

  return (
    <div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1">Career</div>
      <div className="text-xs text-[#5B6773] mb-4">
        Applications received from the public Career page. Select one to view full details, then tick a folder to move it there and mark it reviewed.
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {careerFolders.map((f) => (
          <button
            key={f.key}
            onClick={() => setFolder(f.key)}
            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
            style={{ background: folder === f.key ? "#1996C8" : "#fff", color: folder === f.key ? "#fff" : "#3A4652", border: folder === f.key ? "none" : "1px solid #E4E9EC" }}
          >
            <span>{f.label}</span>
            {f.badge > 0 && (
              <span className="min-w-[16px] h-4 px-1 rounded-full bg-[#D64545] text-white text-[10px] font-bold flex items-center justify-center">
                {f.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-6 text-center text-xs text-[#8A96A3]">No applications in this folder</div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((a) => (
            <div key={a.email} className="bg-white border border-[#E4E9EC] rounded-[10px] px-[18px] py-3.5 flex justify-between items-start">
              <div>
                <div className="font-bold text-sm text-[#1A2027]">{a.name}</div>
                <div className="text-xs text-[#8A96A3] mt-0.5">
                  {a.email} · {a.phone}
                </div>
                <div className="text-xs text-primary font-semibold mt-1">Applied for: {a.role}</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF1DD] text-[#C9962B] shrink-0">New</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
