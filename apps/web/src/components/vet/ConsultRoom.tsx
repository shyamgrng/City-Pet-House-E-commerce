"use client";

import { useEffect, useRef, useState } from "react";
import { useVet } from "@/context/VetContext";
import type { ChatMessage, SharedDoc, VetBooking } from "@/lib/vet-types";
import { isAllowedDocumentFile, isAllowedImageFile, isAllowedVideoFile, readDocumentFile, readVideoFile, resizeImageFile } from "@/lib/image-upload";
import VideoCall, { vetCallRoomName } from "./VideoCall";

const ATTACH_ACCEPT = "image/*,video/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type FeedItem = ({ type: "message" } & ChatMessage) | ({ type: "doc" } & SharedDoc);

/**
 * Browsers block navigating a new tab straight to a data: URL (a phishing-prevention measure),
 * so a plain `<a href={dataUrl} target="_blank">` silently does nothing -- only the `download`
 * attribute's separate code path is exempt from that block. Converting to a blob: URL first
 * sidesteps the restriction and actually opens the file in the browser's native viewer.
 */
function previewDataUrl(dataUrl: string) {
  try {
    const [meta, base64] = dataUrl.split(",");
    const mime = /data:(.*?);base64/.exec(meta)?.[1] ?? "application/octet-stream";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
    window.open(blobUrl, "_blank", "noopener,noreferrer");
  } catch {
    window.open(dataUrl, "_blank", "noopener,noreferrer");
  }
}

export default function ConsultRoom({
  booking,
  viewer,
  onLeave,
}: {
  booking: VetBooking;
  viewer: "client" | "doctor";
  onLeave?: () => void;
}) {
  const { sendMessage, addClientDocument, addDoctorDocument, saveRecording, saveError, refreshBooking } = useVet();
  const [chatInput, setChatInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachError, setAttachError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backstop for the realtime push -- polls for the other side's messages/files every few
  // seconds so chat still arrives promptly even if a network drops the live subscription.
  useEffect(() => {
    const interval = setInterval(() => refreshBooking(booking.id), 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.id]);

  const toggleRecording = () => {
    if (recording) saveRecording(booking.id);
    setRecording((r) => !r);
  };

  const send = () => {
    if (!chatInput.trim()) return;
    sendMessage(booking.id, viewer, chatInput);
    setChatInput("");
  };

  const addDoc = viewer === "client" ? addClientDocument : addDoctorDocument;
  const otherName = viewer === "client" ? booking.doctorName : booking.ownerName;

  const handleAttach = async (file: File | undefined) => {
    if (!file) return;
    setAttachError("");
    setUploading(true);
    try {
      if (isAllowedImageFile(file)) {
        const url = await resizeImageFile(file, 1200, 1600);
        addDoc(booking.id, { name: file.name, url, kind: "image" });
      } else if (isAllowedVideoFile(file)) {
        const url = await readVideoFile(file);
        addDoc(booking.id, { name: file.name, url, kind: "video" });
      } else if (isAllowedDocumentFile(file)) {
        const url = await readDocumentFile(file);
        addDoc(booking.id, { name: file.name, url, kind: "file" });
      } else {
        setAttachError("Please choose an image, video, PDF, or Word document.");
      }
    } catch (err) {
      setAttachError(err instanceof Error ? err.message : "Could not attach that file — try a different one.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const feed: FeedItem[] = [
    ...booking.chatMessages.map((m): FeedItem => ({ type: "message", ...m })),
    ...booking.clientDocuments.map((d): FeedItem => ({ type: "doc", ...d })),
    ...booking.doctorDocuments.map((d): FeedItem => ({ type: "doc", ...d })),
  ].sort((a, b) => a.ts - b.ts);

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

      <div className="border border-[#E4E9EC] rounded-xl p-4 flex flex-col h-[420px]">
        <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Chat with {otherName}</div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-2.5">
          {feed.length === 0 ? (
            <div className="text-xs text-[#8A96A3] text-center mt-6">No messages yet</div>
          ) : (
            feed.map((item, i) => {
              const mine = item.from === viewer;
              return (
                <div key={i} className="max-w-[75%]" style={{ alignSelf: mine ? "flex-end" : "flex-start" }}>
                  {item.type === "message" ? (
                    <div
                      className="px-3 py-2 text-xs leading-relaxed"
                      style={{
                        background: mine ? "#1996C8" : "#F0F2F4",
                        color: mine ? "#fff" : "#1A2027",
                        borderRadius: mine ? "11px 11px 2px 11px" : "11px 11px 11px 2px",
                      }}
                    >
                      {item.text}
                    </div>
                  ) : (
                    <FeedAttachment item={item} mine={mine} />
                  )}
                </div>
              );
            })
          )}
        </div>
        {(attachError || saveError) && <div className="text-[11px] text-[#D64545] mb-2">{attachError || saveError}</div>}
        <div className="flex gap-2 items-center">
          <input ref={fileInputRef} type="file" accept={ATTACH_ACCEPT} className="hidden" onChange={(e) => handleAttach(e.target.files?.[0])} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Attach a photo, video, or file"
            className="w-9 h-9 shrink-0 rounded-md border border-[#E4E9EC] text-[#5B6773] flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            📎
          </button>
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={uploading ? "Uploading…" : "Type a message…"}
            className="flex-1 h-9 rounded-md border border-[#E4E9EC] px-3 text-xs box-border"
          />
          <button onClick={send} className="bg-primary text-white px-4 h-9 rounded-md text-xs font-semibold cursor-pointer shrink-0">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedAttachment({ item, mine }: { item: SharedDoc; mine: boolean }) {
  if (item.kind === "image" && item.url) {
    return (
      <button type="button" onClick={() => previewDataUrl(item.url)} className="block p-0 border-0 bg-transparent cursor-pointer" title="Tap to view full size">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={item.name} className="w-[200px] h-[200px] rounded-[11px] border border-[#E4E9EC] object-cover" />
      </button>
    );
  }
  if (item.kind === "video" && item.url) {
    return <video src={item.url} controls className="w-[220px] h-[200px] rounded-[11px] border border-[#E4E9EC] bg-black" />;
  }
  const color = mine ? "#fff" : "#1A2027";
  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 rounded-[11px] text-xs"
      style={{ background: mine ? "#1996C8" : "#F0F2F4", color }}
    >
      <span>{item.kind === "video" ? "🎬" : "📎"}</span>
      <span className="truncate max-w-[110px]">{item.name}</span>
      {item.url && (
        <span className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => previewDataUrl(item.url)} className="underline cursor-pointer bg-transparent border-0 p-0" style={{ color }}>
            Preview
          </button>
          <a href={item.url} download={item.name} className="underline" style={{ color }}>
            Download
          </a>
        </span>
      )}
    </div>
  );
}
