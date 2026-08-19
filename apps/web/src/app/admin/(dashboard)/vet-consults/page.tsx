"use client";

import { useState } from "react";
import { vetActivityLog, vetBookings, vetDoctors } from "@/lib/admin-data";

const subTabs = ["Overview", "Payment Queue", "Receipts", "Consult Records", "Recordings", "Reports"];
const typeFilters = ["All", "Booking", "Approval", "Call", "Payment", "Reminder"];

export default function VetConsultsPage() {
  const [active, setActive] = useState(true);
  const [tab, setTab] = useState("Overview");
  const [typeFilter, setTypeFilter] = useState("All");

  const filteredLog = vetActivityLog.filter((a) => typeFilter === "All" || a.type === typeFilter);

  return (
    <div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-4">Vet Consults</div>

      <div className="bg-white border border-[#E4E9EC] rounded-xl px-5 py-4 flex justify-between items-center mb-5">
        <div>
          <div className="text-[13px] font-bold text-[#1A2027]">Web Vet Page Status</div>
          <div className="text-xs text-[#8A96A3]">Live — clients can browse, book, and pay for consults.</div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold" style={{ color: active ? "#1F7A4D" : "#8A96A3" }}>
            {active ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => setActive((v) => !v)}
            className="w-10 h-6 rounded-full relative cursor-pointer transition-colors"
            style={{ background: active ? "#25D366" : "#D8DCE0" }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all"
              style={{ left: active ? "18px" : "2px" }}
            />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {subTabs.map((t) => (
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

      {tab === "Overview" && (
        <>
          <div className="text-[13px] font-bold text-[#1A2027] mb-3">Doctors</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
            {vetDoctors.map((d) => (
              <div key={d.name} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-[#EEF1F3] flex items-center justify-center text-[9px] text-[#8A96A3] shrink-0">
                    Photo
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[13px] text-[#1A2027]">{d.name}</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: d.online ? "#E7F3EC" : "#F0F2F4", color: d.online ? "#1F7A4D" : "#8A96A3" }}
                      >
                        {d.online ? "Online" : "Offline"}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8A96A3] mt-0.5">{d.qualification}</div>
                    <div className="text-[11px] text-[#8A96A3]">{d.nvc}</div>
                  </div>
                </div>
                <div className="flex gap-4 pt-2 border-t border-[#F0F2F4] text-xs">
                  <span>
                    <b>{d.consults}</b> consults
                  </span>
                  <span>
                    <b>{d.completed}</b> completed
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[13px] font-bold text-[#1A2027] mb-3">All Bookings</div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6">
            <div className="grid grid-cols-5 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
              <div>Booking</div>
              <div>Owner</div>
              <div>Doctor</div>
              <div>Amount</div>
              <div>Status</div>
            </div>
            {vetBookings.map((b) => (
              <div key={b.id} className="grid grid-cols-5 px-4 py-3.5 text-xs text-[#1A2027] items-center border-b border-[#F0F2F4] last:border-0">
                <div className="font-bold">{b.id}</div>
                <div>{b.owner}</div>
                <div>{b.doctor}</div>
                <div className="font-semibold">{b.amount}</div>
                <div className="font-semibold text-[#1F7A4D]">{b.status}</div>
              </div>
            ))}
          </div>

          <div className="text-[13px] font-bold text-[#1A2027] mb-2">Activity Log</div>
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {typeFilters.map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
                style={{ background: typeFilter === f ? "#1996C8" : "#F0F2F4", color: typeFilter === f ? "#fff" : "#5B6773" }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_3fr_1fr] px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
              <div>Date</div>
              <div>Time</div>
              <div>Activity</div>
              <div>Type</div>
            </div>
            {filteredLog.map((a, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_3fr_1fr] px-4 py-3 text-xs text-[#1A2027] items-center border-b border-[#F0F2F4] last:border-0">
                <div className="text-[#5B6773]">{a.date}</div>
                <div className="text-[#5B6773]">{a.time}</div>
                <div>{a.activity}</div>
                <div className="font-semibold text-primary">{a.type}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab !== "Overview" && (
        <div className="bg-white border border-dashed border-[#E4E9EC] rounded-[10px] p-8 text-center text-xs text-[#8A96A3]">
          {tab} — coming soon
        </div>
      )}
    </div>
  );
}
