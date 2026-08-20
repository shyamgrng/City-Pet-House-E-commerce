"use client";

import { useState } from "react";
import { useCareer } from "@/context/CareerContext";
import { STATUS_COLORS } from "@/lib/career-types";

export default function CareerPage() {
  const { content, applications, moveToFolder, markRejected, removeApplication } = useCareer();
  const [tab, setTab] = useState("Inbox");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const folders = ["Inbox", ...content.jobs.map((j) => j.title), "Rejected"];
  const badgeFor = (folder: string) =>
    applications.filter((a) =>
      folder === "Inbox" ? a.status === "New" : folder === "Rejected" ? a.status === "Rejected" : a.status === "Reviewed" && a.appliedFor === folder
    ).length;

  const rows = applications.filter((a) =>
    tab === "Inbox" ? a.status === "New" : tab === "Rejected" ? a.status === "Rejected" : a.status === "Reviewed" && a.appliedFor === tab
  );

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1">Career</div>
      <div className="text-xs text-[#5B6773] mb-[18px]">
        Applications received from the public Career page. Select one to view full details, then tick a folder to move it there and mark it reviewed.
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {folders.map((f) => {
          const active = tab === f;
          const badge = badgeFor(f);
          return (
            <button
              key={f}
              onClick={() => {
                setTab(f);
                setSelectedId(null);
              }}
              className="px-4 py-2 rounded-full text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              style={{ background: active ? "#1996C8" : "#fff", color: active ? "#fff" : "#5B6773", border: active ? "none" : "1px solid #E4E9EC" }}
            >
              <span>{f}</span>
              {badge > 0 && (
                <span className="bg-[#D64545] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="text-xs text-[#8A96A3] bg-[#F7F8F9] border border-dashed border-[#E4E9EC] rounded-[10px] p-[22px] text-center">
          No applications in this folder yet.
        </div>
      ) : (
        rows.map((a) => {
          const selected = selectedId === a.id;
          const colors = STATUS_COLORS[a.status];
          return (
            <div
              key={a.id}
              onClick={() => setSelectedId(selected ? null : a.id)}
              className="bg-white rounded-[10px] p-4 mb-2.5 cursor-pointer"
              style={{ border: `1px solid ${selected ? "#1996C8" : "#E4E9EC"}` }}
            >
              <div className="flex justify-between items-start gap-2.5">
                <div>
                  <div className="text-[13px] font-bold text-[#1A2027]">{a.name}</div>
                  <div className="text-[11px] text-[#8A96A3] mt-0.5">
                    {a.email} · {a.phone}
                  </div>
                  <div className="text-[11px] font-semibold text-primary mt-1">Applied for: {a.appliedFor}</div>
                </div>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={{ background: colors.bg, color: colors.color }}
                >
                  {a.status}
                </span>
              </div>

              {selected && (
                <div onClick={(e) => e.stopPropagation()} className="mt-3.5 pt-3.5 border-t border-[#F0F2F4]">
                  <div className="grid grid-cols-2 gap-2.5 text-xs text-[#1A2027] mb-3">
                    <div>
                      <span className="text-[#8A96A3]">Name:</span> {a.name}
                    </div>
                    <div>
                      <span className="text-[#8A96A3]">Phone:</span> {a.phone}
                    </div>
                    <div>
                      <span className="text-[#8A96A3]">Email:</span> {a.email}
                    </div>
                    <div>
                      <span className="text-[#8A96A3]">Address:</span> {a.address}
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-[#8A96A3] mb-1.5">COVER LETTER</div>
                  <div className="text-xs text-[#5B6773] leading-relaxed mb-3 bg-[#F7F8F9] rounded-lg px-3 py-2.5">{a.coverLetter}</div>
                  <div className="text-xs text-primary font-semibold underline mb-3.5">📎 {a.cvName}</div>
                  <div className="text-[11px] text-[#8A96A3] mb-3.5">Submitted {fmtDate(a.submittedAt)}</div>

                  <div className="text-[11px] font-bold text-[#8A96A3] mb-2">MOVE TO FOLDER (marks reviewed)</div>
                  <div className="flex flex-col gap-2 mb-4">
                    {content.jobs.map((job) => (
                      <label key={job.id} className="flex items-center gap-2 text-xs text-[#1A2027] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={a.appliedFor === job.title && a.status === "Reviewed"}
                          onChange={() => {
                            moveToFolder(a.id, job.title);
                            setSelectedId(null);
                          }}
                          className="w-4 h-4"
                        />
                        {job.title}
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end items-center gap-3.5 flex-wrap">
                    <div
                      onClick={() => {
                        markRejected(a.id);
                        setSelectedId(null);
                      }}
                      className="text-xs font-semibold text-[#C9962B] cursor-pointer"
                    >
                      Reject
                    </div>
                    <div
                      onClick={() => {
                        removeApplication(a.id);
                        setSelectedId(null);
                      }}
                      className="text-xs font-semibold text-[#D64545] cursor-pointer"
                    >
                      Delete Application
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
