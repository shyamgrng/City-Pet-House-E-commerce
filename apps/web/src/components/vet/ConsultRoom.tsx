"use client";

import { useState } from "react";
import { useVet } from "@/context/VetContext";
import type { VetBooking } from "@/lib/vet-types";
import VideoCall, { vetCallRoomName } from "./VideoCall";

export default function ConsultRoom({
  booking,
  viewer,
  onLeave,
}: {
  booking: VetBooking;
  viewer: "client" | "doctor";
  onLeave?: () => void;
}) {
  const { sendMessage, addClientDocument, addDoctorDocument, saveRecording } = useVet();
  const [chatInput, setChatInput] = useState("");
  const [justShared, setJustShared] = useState(false);
  const [recording, setRecording] = useState(false);

  const toggleRecording = () => {
    if (recording) saveRecording(booking.id);
    setRecording((r) => !r);
  };

  const send = () => {
    if (!chatInput.trim()) return;
    sendMessage(booking.id, viewer, chatInput);
    setChatInput("");
  };

  const share = () => {
    const name = viewer === "client" ? "pet-photo.jpg" : "prescription.pdf";
    if (viewer === "client") addClientDocument(booking.id, name);
    else addDoctorDocument(booking.id, name);
    setJustShared(true);
    setTimeout(() => setJustShared(false), 3000);
  };

  const sharedList = viewer === "client" ? booking.doctorDocuments : booking.clientDocuments;

  return (
    <div className="border border-[#E4E9EC] rounded-2xl p-4 mb-4">
      <div className="flex justify-between items-center mb-2.5 flex-wrap gap-2">
        <div className="text-xs font-bold text-[#8A96A3] tracking-wide">🎥 LIVE CONSULT</div>
        <div className="flex items-center gap-2">
          {recording && <div className="text-[11px] font-semibold text-[#C9962B]">● Recording…</div>}
          {viewer === "doctor" && (
            <button
              onClick={toggleRecording}
              className="px-3 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer text-white"
              style={{ background: recording ? "#C9962B" : "#3A4652" }}
            >
              {recording ? "⏹ Stop Recording" : "⏺ Start Recording"}
            </button>
          )}
          {onLeave && (
            <button onClick={onLeave} className="bg-[#FDEDEC] text-[#D64545] px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer">
              Leave Call
            </button>
          )}
        </div>
      </div>
      <div className="mb-4">
        <VideoCall
          roomName={vetCallRoomName(booking.id)}
          displayName={viewer === "client" ? booking.ownerName : booking.doctorName}
          onLeave={onLeave}
        />
      </div>

      <div className="flex gap-4 flex-wrap items-start">
        <div className="flex-1 min-w-[260px] border border-[#E4E9EC] rounded-xl p-4 flex flex-col h-[280px]">
          <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Chat with {viewer === "client" ? booking.doctorName : booking.ownerName}</div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-2.5">
            {booking.chatMessages.length === 0 ? (
              <div className="text-xs text-[#8A96A3] text-center mt-4">No messages yet</div>
            ) : (
              booking.chatMessages.map((msg, i) => {
                const mine = msg.from === viewer;
                return (
                  <div
                    key={i}
                    className="max-w-[80%] px-3 py-2 text-xs leading-relaxed"
                    style={{
                      alignSelf: mine ? "flex-end" : "flex-start",
                      background: mine ? "#1996C8" : "#F0F2F4",
                      color: mine ? "#fff" : "#1A2027",
                      borderRadius: mine ? "11px 11px 2px 11px" : "11px 11px 11px 2px",
                    }}
                  >
                    {msg.text}
                  </div>
                );
              })
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
              className="flex-1 h-9 rounded-md border border-[#E4E9EC] px-3 text-xs box-border"
            />
            <button onClick={send} className="bg-primary text-white px-4 rounded-md text-xs font-semibold cursor-pointer">
              Send
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-[260px] border border-[#E4E9EC] rounded-xl p-4">
          <div className="text-[13px] font-bold text-[#1A2027] mb-2">
            {viewer === "client" ? "Send a Photo to Doctor" : "Send a Document to Client"}
          </div>
          <button
            onClick={share}
            className="w-full h-[70px] mb-2.5 rounded-lg border-2 border-dashed border-[#E4E9EC] flex items-center justify-center text-xs text-[#8A96A3] cursor-pointer"
          >
            Upload &amp; Send
          </button>
          {justShared && <div className="text-[11px] text-[#1F7A4D] mb-2">✓ Sent</div>}
          <div className="text-xs font-semibold text-[#1A2027] mb-1.5">
            {viewer === "client" ? "Doctor's Shared Files" : "Client's Shared Files"}
          </div>
          {sharedList.length === 0 ? (
            <div className="text-xs text-[#8A96A3]">No files shared yet</div>
          ) : (
            <div className="flex flex-col gap-1">
              {sharedList.map((d, i) => (
                <div key={i} className="text-xs text-[#3A4652]">
                  📎 {d.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
