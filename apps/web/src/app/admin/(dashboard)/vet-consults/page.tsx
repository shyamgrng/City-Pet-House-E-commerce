"use client";

import { useMemo, useState } from "react";
import { useVet } from "@/context/VetContext";
import { ACTIVITY_TYPE_COLORS, STATUS_COLORS, type ActivityType, type VetBooking } from "@/lib/vet-types";

const subTabs = ["Overview", "Payment Queue", "Receipts", "Consult Records", "Recordings", "Reports"] as const;
type SubTab = (typeof subTabs)[number];

const ACTIVITY_TYPES: (ActivityType | "All")[] = ["All", "Booking", "Approval", "Call", "Payment", "Reminder"];
const ACTIVITY_LIMITS = [10, 25, 50, 100];
const DATE_RANGES = ["Today", "Yesterday", "Last 7 days", "All time"] as const;

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function dayOffset(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - d.getTime()) / 86400000);
}

export default function VetConsultsPage() {
  const { doctors, bookings, activityLog, webVetActive, toggleWebVetActive, approvePayment, rejectPayment, finalizeBooking, sendInvoice } = useVet();
  const [tab, setTab] = useState<SubTab>("Overview");

  const [detailBookingId, setDetailBookingId] = useState<string | null>(null);
  const [receiptBookingId, setReceiptBookingId] = useState<string | null>(null);
  const [recordSearch, setRecordSearch] = useState("");
  const [openRecordId, setOpenRecordId] = useState<string | null>(null);

  const [activitySearch, setActivitySearch] = useState("");
  const [activityType, setActivityType] = useState<ActivityType | "All">("All");
  const [activityLimit, setActivityLimit] = useState(10);
  const [activityRange, setActivityRange] = useState<(typeof DATE_RANGES)[number]>("All time");

  const paymentQueue = bookings.filter((b) => b.status === "Payment Review" || b.status === "Awaiting Doctor Reconfirm");
  const detailBooking = bookings.find((b) => b.id === detailBookingId) ?? null;
  const receiptBooking = bookings.find((b) => b.id === receiptBookingId) ?? null;
  const openRecord = bookings.find((b) => b.id === openRecordId) ?? null;

  const filteredActivity = useMemo(() => {
    const q = activitySearch.trim().toLowerCase();
    return activityLog.filter((a) => {
      if (q && !a.text.toLowerCase().includes(q)) return false;
      if (activityType !== "All" && a.type !== activityType) return false;
      const off = dayOffset(a.ts);
      if (activityRange === "Today" && off !== 0) return false;
      if (activityRange === "Yesterday" && off !== 1) return false;
      if (activityRange === "Last 7 days" && off > 7) return false;
      return true;
    });
  }, [activityLog, activitySearch, activityType, activityRange]);

  const receiptsList = bookings.filter(
    (b) => b.status !== "Payment Review" && b.status !== "Awaiting Doctor Reconfirm" && b.status !== "Pending Payment",
  );

  const recordsList = bookings.filter((b) => {
    const q = recordSearch.trim().toLowerCase();
    if (!q) return true;
    return b.ownerName.toLowerCase().includes(q) || b.petName.toLowerCase().includes(q) || b.doctorName.toLowerCase().includes(q);
  });

  const recordings = bookings.flatMap((b) =>
    b.doctorDocuments.filter((d) => d.name.startsWith("Consult_Recording_")).map((d) => ({ booking: b, doc: d })),
  );

  const totalConsults = bookings.length;
  const completedCount = bookings.filter((b) => b.status === "Completed").length;
  const pendingApprovalCount = bookings.filter((b) => b.status === "Payment Review").length;
  const revenueCollected = bookings
    .filter((b) => b.status === "Confirmed" || b.status === "In Progress" || b.status === "Completed")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-4">Vet Consults</div>

      <div
        onClick={toggleWebVetActive}
        className="bg-white border border-[#E4E9EC] rounded-xl px-5 py-4 flex justify-between items-center mb-5 max-w-[520px] cursor-pointer"
      >
        <div>
          <div className="text-[13px] font-bold text-[#1A2027]">Web Vet Page Status</div>
          <div className="text-xs text-[#8A96A3] mt-0.5">
            {webVetActive ? 'Live — clients can browse, book, and pay for consults.' : 'Hidden — clients see an "Under Construction" notice instead.'}
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 ml-3">
          <span className="text-xs font-semibold" style={{ color: webVetActive ? "#1F7A4D" : "#8A96A3" }}>
            {webVetActive ? "Active" : "Inactive"}
          </span>
          <div className="w-10 h-6 rounded-full relative" style={{ background: webVetActive ? "#1F7A4D" : "#D0D6DA" }}>
            <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all" style={{ left: webVetActive ? "18px" : "2px" }} />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap bg-[#F0F2F4] rounded-[9px] p-1 max-w-[560px]">
        {subTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
            style={{ background: tab === t ? "#1996C8" : "transparent", color: tab === t ? "#fff" : "#3A4652" }}
          >
            {t}
            {t === "Payment Queue" && paymentQueue.length > 0 && (
              <span className="min-w-[17px] h-[17px] px-1 rounded-full bg-[#C9962B] text-white text-[10px] font-bold flex items-center justify-center">
                {paymentQueue.length}
              </span>
            )}
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
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6">
            <div className="grid grid-cols-5 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
              <div>Booking</div>
              <div>Owner</div>
              <div>Doctor</div>
              <div>Amount</div>
              <div>Status</div>
            </div>
            {bookings.length === 0 ? (
              <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No vet consult bookings yet</div>
            ) : (
              bookings.map((b) => (
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
              ))
            )}
          </div>

          <div className="flex justify-between items-center mb-3 flex-wrap gap-2.5">
            <div className="text-[13px] font-bold text-[#1A2027]">Activity Log</div>
            <div className="flex gap-1.5 items-center">
              <span className="text-[11px] text-[#8A96A3] mr-0.5">Show</span>
              {ACTIVITY_LIMITS.map((n) => (
                <button
                  key={n}
                  onClick={() => setActivityLimit(n)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer"
                  style={{ background: activityLimit === n ? "#1996C8" : "#F0F2F4", color: activityLimit === n ? "#fff" : "#5B6773" }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <input
            value={activitySearch}
            onChange={(e) => setActivitySearch(e.target.value)}
            placeholder="Search doctor, client, or activity…"
            className="w-full max-w-[360px] box-border px-3.5 py-2.5 rounded-lg border border-[#E4E9EC] text-xs mb-3.5"
          />
          <div className="flex gap-2.5 items-center mb-2.5 flex-wrap">
            {ACTIVITY_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setActivityType(t)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
                style={{ background: activityType === t ? "#1996C8" : "#F0F2F4", color: activityType === t ? "#fff" : "#5B6773" }}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2.5 items-center mb-4 flex-wrap">
            {DATE_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setActivityRange(r)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer border"
                style={{
                  background: activityRange === r ? "#1996C8" : "#fff",
                  color: activityRange === r ? "#fff" : "#5B6773",
                  borderColor: activityRange === r ? "#1996C8" : "#E4E9EC",
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-[0.9fr_0.7fr_2.4fr_1fr] px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
              <div>Date</div>
              <div>Time</div>
              <div>Activity</div>
              <div>Type</div>
            </div>
            {filteredActivity.length === 0 ? (
              <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No activity matches these filters</div>
            ) : (
              filteredActivity.slice(0, activityLimit).map((a) => (
                <div key={a.id} className="grid grid-cols-[0.9fr_0.7fr_2.4fr_1fr] px-4 py-3 text-xs text-[#1A2027] items-center border-b border-[#F0F2F4] last:border-0">
                  <div className="text-[#5B6773]">{fmtDate(a.ts)}</div>
                  <div className="text-[#5B6773]">{fmtTime(a.ts)}</div>
                  <div>{a.text}</div>
                  <div className="text-[11px] font-semibold" style={{ color: ACTIVITY_TYPE_COLORS[a.type] }}>
                    {a.type}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {tab === "Payment Queue" && (
        <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1.3fr_0.9fr] px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
            <div>Booking</div>
            <div>Owner</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Action</div>
          </div>
          {paymentQueue.length === 0 ? (
            <div className="px-4 py-6 text-xs text-[#8A96A3] text-center">No payments waiting for review.</div>
          ) : (
            paymentQueue.map((b) => (
              <div
                key={b.id}
                onClick={() => setDetailBookingId(b.id)}
                className="grid grid-cols-[1.4fr_1fr_1fr_1.3fr_0.9fr] px-4 py-3.5 text-xs items-center border-b border-[#F0F2F4] last:border-0 cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-[#1A2027]">
                    {b.ownerName} — {b.petName}
                  </div>
                  <div className="text-[11px] text-[#8A96A3] mt-0.5">{b.id} · {b.doctorName}</div>
                </div>
                <div className="text-[#5B6773]">{b.ownerName}</div>
                <div className="font-semibold">Rs. {b.amount}</div>
                <div className="text-[11px] font-semibold" style={{ color: STATUS_COLORS[b.status] }}>
                  {b.status === "Payment Review" ? "Needs approval" : "Awaiting doctor reconfirm"}
                </div>
                <div className="text-[#1996C8] text-[11px] font-semibold">View →</div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "Receipts" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {receiptsList.length === 0 ? (
            <div className="col-span-full px-4 py-6 text-xs text-[#8A96A3] text-center">No receipts processed yet</div>
          ) : (
            receiptsList.map((b) => (
              <div key={b.id} className="bg-white border border-[#E4E9EC] rounded-[10px] p-3.5">
                <div
                  onClick={() => setReceiptBookingId(b.id)}
                  className="h-[100px] rounded-lg flex items-center justify-center text-[22px] cursor-pointer mb-2.5"
                  style={{ backgroundImage: "repeating-linear-gradient(45deg,#EDEFF1,#EDEFF1 6px,#E4E7EA 6px,#E4E7EA 12px)" }}
                >
                  🧾
                </div>
                <div className="text-xs font-semibold text-[#1A2027]">
                  {b.id} — Rs. {b.amount}
                </div>
                <div className="text-[11px] text-[#5B6773] mt-0.5 mb-2">
                  {b.ownerName} · {b.doctorName}
                </div>
                {b.invoiceSent ? (
                  <div className="bg-[#EAF6EE] border border-[#CFE9D8] rounded-[7px] px-2.5 py-2 text-[10px] text-[#3A6B4C] leading-relaxed">
                    ✓ Processed — {b.invoiceNumber}
                    <br />
                    Emailed to {b.ownerEmail}
                  </div>
                ) : (
                  <div className="bg-[#F0F2F4] rounded-[7px] px-2.5 py-2 text-[10px] text-[#8A96A3]">Not yet processed</div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "Consult Records" && !openRecord && (
        <>
          <input
            value={recordSearch}
            onChange={(e) => setRecordSearch(e.target.value)}
            placeholder="Search by client, pet or doctor…"
            className="w-full max-w-[420px] box-border px-3.5 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3.5"
          />
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-[1.2fr_1fr_1.2fr_0.7fr_0.7fr_0.6fr] px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
              <div>Client</div>
              <div>Pet</div>
              <div>Doctor</div>
              <div>Messages</div>
              <div>Files</div>
              <div></div>
            </div>
            {recordsList.length === 0 ? (
              <div className="px-4 py-6 text-[13px] text-[#8A96A3] text-center">No consult records yet</div>
            ) : (
              recordsList.map((r) => (
                <div key={r.id} className="grid grid-cols-[1.2fr_1fr_1.2fr_0.7fr_0.7fr_0.6fr] px-4 py-3 text-[13px] text-[#1A2027] border-b border-[#F0F2F4] items-center">
                  <div className="font-semibold">{r.ownerName}</div>
                  <div>{r.petName}</div>
                  <div className="text-xs text-[#5B6773]">{r.doctorName}</div>
                  <div>{r.chatMessages.length}</div>
                  <div>{r.clientDocuments.length + r.doctorDocuments.length}</div>
                  <div onClick={() => setOpenRecordId(r.id)} className="text-xs font-semibold text-primary cursor-pointer">
                    View
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {tab === "Consult Records" && openRecord && (
        <div>
          <div onClick={() => setOpenRecordId(null)} className="text-[13px] font-semibold text-primary cursor-pointer mb-3.5">
            ← Back to all records
          </div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-[18px] mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-[13px]">
              <RecordField label="Client" value={openRecord.ownerName} />
              <RecordField label="Pet" value={openRecord.petName} />
              <RecordField label="Doctor" value={openRecord.doctorName} />
              <RecordField label="Sessions" value={String(openRecord.callStartedByDoctor ? 1 : 0)} />
            </div>
          </div>

          <div className="flex gap-4 items-start flex-wrap">
            <div className="flex-1 min-w-[340px] bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E4E9EC] text-[13px] font-bold text-[#1A2027]">Conversation History</div>
              <div className="max-h-[480px] overflow-y-auto p-4 flex flex-col gap-2.5" style={{ background: "linear-gradient(180deg,#F7F9FA,#fff)" }}>
                {openRecord.chatMessages.length === 0 ? (
                  <div className="text-xs text-[#8A96A3] text-center py-5">No messages recorded</div>
                ) : (
                  openRecord.chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className="max-w-[78%] px-3 py-2.5 rounded-xl text-[13px] leading-relaxed"
                      style={{
                        alignSelf: msg.from === "client" ? "flex-start" : "flex-end",
                        background: msg.from === "client" ? "#F0F2F4" : "#EAF4F9",
                        border: `1px solid ${msg.from === "client" ? "#E4E9EC" : "#CFE7F2"}`,
                        color: "#1A2027",
                      }}
                    >
                      <div className="text-[10px] font-bold opacity-75 mb-0.5">{msg.from === "client" ? openRecord.ownerName : openRecord.doctorName}</div>
                      <div>{msg.text}</div>
                      <div className="text-[10px] opacity-60 mt-1">{msg.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="w-full lg:w-[300px] bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E4E9EC] text-[13px] font-bold text-[#1A2027]">Shared Files &amp; Photos</div>
              <div className="p-3.5 flex flex-col gap-3">
                {[...openRecord.clientDocuments, ...openRecord.doctorDocuments].length === 0 ? (
                  <div className="text-xs text-[#8A96A3] text-center py-3">No files shared</div>
                ) : (
                  [...openRecord.clientDocuments, ...openRecord.doctorDocuments]
                    .sort((a, b) => a.ts - b.ts)
                    .map((doc, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg bg-[#F7F9FA] border border-[#E4E9EC]">
                        <div className="text-base">{doc.name.startsWith("Consult_Recording_") ? "🎬" : "📄"}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-[#1A2027] break-all">{doc.name}</div>
                          <div className="text-[10px] text-[#8A96A3]">
                            {fmtDate(doc.ts)} · {fmtTime(doc.ts)}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "Recordings" && (
        <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr_0.8fr] px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
            <div>Recording</div>
            <div>Client</div>
            <div>Doctor</div>
            <div>Date</div>
            <div>Time</div>
          </div>
          {recordings.length === 0 ? (
            <div className="px-4 py-6 text-xs text-[#8A96A3] text-center">No call recordings yet</div>
          ) : (
            recordings.map(({ booking, doc }) => (
              <div
                key={doc.name + doc.ts}
                className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr_0.8fr] px-4 py-3 text-xs text-[#1A2027] items-center border-b border-[#F0F2F4] last:border-0"
              >
                <div className="font-semibold">🎬 {doc.name}</div>
                <div>{booking.ownerName}</div>
                <div>{booking.doctorName}</div>
                <div className="text-[#5B6773]">{fmtDate(doc.ts)}</div>
                <div className="text-[#5B6773]">{fmtTime(doc.ts)}</div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "Reports" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
            <ReportCard label="Total Consults" value={String(totalConsults)} />
            <ReportCard label="Completed" value={String(completedCount)} />
            <ReportCard label="Pending Approval" value={String(pendingApprovalCount)} />
            <ReportCard label="Revenue Collected" value={`Rs. ${revenueCollected.toLocaleString("en-IN")}`} />
          </div>
          <div className="text-[13px] font-bold text-[#1A2027] mb-3">Consults per Doctor</div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-3 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
              <div>Doctor</div>
              <div>Consults</div>
              <div>Completed</div>
            </div>
            {doctors.map((d) => (
              <div key={d.id} className="grid grid-cols-3 px-4 py-3 text-xs text-[#1A2027] border-b border-[#F0F2F4] last:border-0">
                <div className="font-semibold">{d.name}</div>
                <div>{bookings.filter((b) => b.doctorId === d.id).length}</div>
                <div>{bookings.filter((b) => b.doctorId === d.id && b.status === "Completed").length}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {detailBooking && (
        <PaymentDetailModal
          booking={detailBooking}
          onClose={() => setDetailBookingId(null)}
          onApprove={() => approvePayment(detailBooking.id)}
          onReject={() => {
            rejectPayment(detailBooking.id);
            setDetailBookingId(null);
          }}
          onFinalize={() => finalizeBooking(detailBooking.id)}
        />
      )}

      {receiptBooking && (
        <ReceiptModal booking={receiptBooking} onClose={() => setReceiptBookingId(null)} onSend={() => sendInvoice(receiptBooking.id)} />
      )}
    </div>
  );
}

function RecordField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-[#8A96A3] mb-0.5">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function ReportCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-[#E4E9EC] rounded-xl p-[18px]">
      <div className="text-[11px] text-[#8A96A3] font-semibold mb-2 uppercase">{label}</div>
      <div className="text-[22px] font-bold text-[#1A2027]">{value}</div>
    </div>
  );
}

function PaymentDetailModal({
  booking,
  onClose,
  onApprove,
  onReject,
  onFinalize,
}: {
  booking: VetBooking;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onFinalize: () => void;
}) {
  const isPendingApproval = booking.status === "Payment Review";
  const isAwaitingDoctorConfirm = booking.status === "Awaiting Doctor Reconfirm";

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[420px] max-h-[86vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[15px] font-bold text-[#1A2027]">{booking.id}</div>
          <div onClick={onClose} className="text-base text-[#8A96A3] cursor-pointer">✕</div>
        </div>

        <div className="text-[11px] font-bold text-[#8A96A3] uppercase mb-1.5">Client Profile</div>
        <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-[10px] p-3.5 mb-4">
          <div className="text-[13px] font-bold text-[#1A2027] mb-1">{booking.ownerName}</div>
          <div className="text-xs text-[#5B6773] mb-0.5">{booking.ownerPhone}</div>
          <div className="text-xs text-[#5B6773]">{booking.ownerEmail}</div>
        </div>

        <div className="text-[11px] font-bold text-[#8A96A3] uppercase mb-1.5">Consult Request</div>
        <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-[10px] p-3.5 mb-4 text-xs text-[#1A2027] leading-loose">
          <div>
            Pet: {booking.petName} ({booking.petSpecies}, {booking.petAge})
          </div>
          <div>Doctor: {booking.doctorName}</div>
          <div>When: {booking.instant ? "Instant" : `${booking.scheduledDate} ${booking.scheduledTime}`}</div>
          <div>Reason: {booking.reason}</div>
          <div>Amount: Rs. {booking.amount}</div>
        </div>

        <div className="text-[11px] font-bold text-[#8A96A3] uppercase mb-1.5">Payment Receipt</div>
        <div className="h-[240px] mb-4 rounded-lg overflow-hidden bg-[#F7F9FA] border border-[#E4E9EC] flex items-center justify-center">
          {booking.receiptPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={booking.receiptPhoto} alt="payment receipt" className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-[#8A96A3]">No screenshot uploaded</span>
          )}
        </div>

        {isPendingApproval && (
          <div className="flex gap-2.5">
            <button onClick={onApprove} className="flex-1 text-center bg-[#1F7A4D] text-white py-3 rounded-[9px] text-[13px] font-semibold cursor-pointer">
              Approve Payment
            </button>
            <button onClick={onReject} className="bg-[#F0F2F4] text-[#D64545] px-[18px] py-3 rounded-[9px] text-[13px] font-semibold cursor-pointer">
              Reject
            </button>
          </div>
        )}
        {isAwaitingDoctorConfirm && (
          <>
            <div className="bg-[#FFF8EA] border border-[#F0DFAE] rounded-[10px] px-3.5 py-3 text-xs text-[#6B5D2E] leading-relaxed mb-3.5">
              Payment approved. Call {booking.doctorName} to reconfirm they&apos;re available for this consult before it&apos;s finalized.
            </div>
            <button onClick={onFinalize} className="w-full text-center bg-primary text-white py-3 rounded-[9px] text-[13px] font-semibold cursor-pointer">
              Doctor Reconfirmed — Finalize
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ReceiptModal({ booking, onClose, onSend }: { booking: VetBooking; onClose: () => void; onSend: () => void }) {
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[380px]">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[15px] font-bold text-[#1A2027]">Invoice — {booking.invoiceNumber}</div>
          <div onClick={onClose} className="text-base text-[#8A96A3] cursor-pointer">✕</div>
        </div>
        <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-[10px] p-3.5 mb-4 text-xs text-[#1A2027] leading-loose">
          <div>Booking: {booking.id}</div>
          <div>Client: {booking.ownerName}</div>
          <div>Doctor: {booking.doctorName}</div>
          <div>Amount: Rs. {booking.amount}</div>
          <div>Email: {booking.ownerEmail}</div>
        </div>
        {booking.invoiceSent ? (
          <div className="bg-[#EAF6EE] border border-[#CFE9D8] rounded-[10px] px-3.5 py-3 text-xs text-[#3A6B4C]">
            ✓ Invoice emailed to {booking.ownerEmail}
          </div>
        ) : (
          <button onClick={onSend} className="w-full text-center bg-primary text-white py-3 rounded-[9px] text-[13px] font-semibold cursor-pointer">
            Send Invoice
          </button>
        )}
      </div>
    </div>
  );
}
