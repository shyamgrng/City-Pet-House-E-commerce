"use client";

import DailyIframe, { type DailyCall } from "@daily-co/daily-js";
import { useEffect, useRef, useState } from "react";

/**
 * Real video call embed via Daily.co. roomName must be the same deterministic value on both
 * the doctor's and client's pages for a given booking so they land in the same room.
 *
 * We switched here from the free public Jitsi server (meet.jit.si) because since August 2024
 * it requires the first person in any room to authenticate with a personal Google/GitHub/
 * Facebook account to become moderator -- a step that can't be done through an embedded call
 * window, so anonymous doctor/client calls got stuck on "please wait for a moderator" forever.
 * Daily has no such requirement.
 */
export default function VideoCall({
  roomName,
  displayName,
  onLeave,
}: {
  roomName: string;
  displayName: string;
  onLeave?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/daily-room?room=${encodeURIComponent(roomName)}`);
        const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
        if (!res.ok || !data.ok || !data.url) throw new Error(data.error || "Could not set up the video call room.");
        if (cancelled || !containerRef.current) return;

        const call = DailyIframe.createFrame(containerRef.current, {
          iframeStyle: { width: "100%", height: "100%", border: "0" },
          showLeaveButton: true,
        });
        callRef.current = call;
        call.on("left-meeting", () => onLeave?.());
        await call.join({ url: data.url, userName: displayName });
      } catch {
        if (!cancelled) setError("Could not load the video call service — check your internet connection and try again.");
      }
    })();

    return () => {
      cancelled = true;
      callRef.current?.destroy();
      callRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName]);

  if (error) {
    return (
      <div className="w-full h-[340px] rounded-[10px] bg-[#FDEDEC] border border-[#F3C7C3] flex items-center justify-center text-center px-6">
        <div className="text-sm text-[#8A3A34]">{error}</div>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-[460px] rounded-[10px] overflow-hidden bg-white border border-[#E4E9EC]" />;
}

export function vetCallRoomName(bookingId: string) {
  return `cph-vet-${bookingId}`.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
}
