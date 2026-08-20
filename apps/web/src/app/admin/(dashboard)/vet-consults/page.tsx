"use client";

import { useState } from "react";
import { useVet } from "@/context/VetContext";
import { STATUS_COLORS } from "@/lib/vet-types";

const subTabs = ["Overview", "Payment Queue", "Receipts", "Consult Records", "Recordings", "Reports"];

export default function VetConsultsPage() {
  const [active, setActive] = useState(true);
  const [tab, setTab] = useState("Overview");
  const { doctors, bookings, approvePayment } = useVet();

  const paymentQueue = bookings.filter((b) => b.status === "Payment Review");

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
            {doctors.map((d) => (
              <div key={d.id} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
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
                    <div className="text-[11px] text-[#8A96A3]">{d.nvcNumber}</div>
                  </div>
                </div>
                <div className="flex gap-4 pt-2 border-t border-[#F0F2F4] text-xs">
                  <span>
                    <b>{bookings.filter((b) => b.doctorId === d.id).length}</b> consults
                  </span>
                  <span>
                    <b>{bookings.filter((b) => b.doctorId === d.id && b.status === "Completed").length}</b> completed
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[13px] font-bold text-[#1A2027] mb-3">All Bookings</div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-5 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
              <div>Booking</div>
              <div>Owner</div>
              <div>Doctor</div>
              <div>Amount</div>
              <div>Status</div>
            </div>
            {bookings.map((b) => (
              <div key={b.id} className="grid grid-cols-5 px-4 py-3.5 text-xs text-[#1A2027] items-center border-b border-[#F0F2F4] last:border-0">
                <div className="font-bold">{b.id}</div>
                <div>
                  {b.ownerName} — {b.petName}
                </div>
                <div>{b.doctorName}</div>
                <div className="font-semibold">Rs. {b.amount}</div>
                <div className="font-semibold" style={{ color: STATUS_COLORS[b.status] }}>
                  {b.status}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "Payment Queue" && (
        <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_0.9fr] px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
            <div>Booking</div>
            <div>Doctor</div>
            <div>Amount</div>
            <div>Actions</div>
          </div>
          {paymentQueue.length === 0 ? (
            <div className="px-4 py-6 text-xs text-[#8A96A3] text-center">No payments waiting for approval.</div>
          ) : (
            paymentQueue.map((b) => (
              <div key={b.id} className="grid grid-cols-[1.4fr_1fr_1fr_0.9fr] px-4 py-3.5 text-xs items-center border-b border-[#F0F2F4] last:border-0">
                <div>
                  <div className="font-semibold text-[#1A2027]">
                    {b.ownerName} — {b.petName}
                  </div>
                  <div className="text-[11px] text-[#8A96A3] mt-0.5">{b.id} · receipt uploaded</div>
                </div>
                <div className="text-[#5B6773]">{b.doctorName}</div>
                <div className="font-semibold">Rs. {b.amount}</div>
                <div>
                  <button
                    onClick={() => approvePayment(b.id)}
                    className="bg-primary text-white text-[11px] font-semibold px-3.5 py-2 rounded-md cursor-pointer"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab !== "Overview" && tab !== "Payment Queue" && (
        <div className="bg-white border border-dashed border-[#E4E9EC] rounded-[10px] p-8 text-center text-xs text-[#8A96A3]">
          {tab} — coming soon
        </div>
      )}
    </div>
  );
}
