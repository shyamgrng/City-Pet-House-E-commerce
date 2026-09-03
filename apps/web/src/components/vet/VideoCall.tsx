"use client";

import { useEffect, useRef, useState } from "react";

// Public, free Jitsi server -- real WebRTC audio/video between two different devices, with no
// API keys, account, or backend of our own required. Jitsi's own server handles room presence
// and signaling, which is why this works across two separate browsers even though the rest of
// this app has no shared backend (everything else is per-browser localStorage).
const JITSI_DOMAIN = "meet.jit.si";

type JitsiApi = {
  addEventListener: (event: string, cb: (...args: unknown[]) => void) => void;
  dispose: () => void;
};

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => JitsiApi;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadJitsiScript(): Promise<void> {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://${JITSI_DOMAIN}/external_api.js`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("load failed"));
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

/**
 * Real video call embed. roomName must be the same deterministic value on both the doctor's
 * and client's pages for a given booking so they land in the same Jitsi room.
 *
 * Caveat worth knowing: meet.jit.si is a public server -- anyone who guesses the room name
 * could join. Fine for a demo/prototype; a real deployment handling patient consults should
 * move to a private/self-hosted Jitsi (or a paid provider) with authenticated rooms.
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
  const apiRef = useRef<JitsiApi | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadJitsiScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return;
        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: { displayName },
          configOverwrite: { prejoinPageEnabled: false, disableDeepLinking: true, startWithAudioMuted: false, startWithVideoMuted: false },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: ["microphone", "camera", "desktop", "chat", "tileview", "hangup", "fullscreen"],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          },
        });
        apiRef.current = api;
        api.addEventListener("readyToClose", () => onLeave?.());
      })
      .catch(() => setError("Could not load the video call service — check your internet connection and try again."));
    return () => {
      cancelled = true;
      apiRef.current?.dispose();
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName]);

  if (error) {
    return (
      <div className="w-full h-[340px] rounded-[10px] bg-[#111823] flex items-center justify-center text-center px-6">
        <div className="text-sm text-[#F0A0A0]">{error}</div>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-[420px] rounded-[10px] overflow-hidden bg-[#111823]" />;
}

export function vetCallRoomName(bookingId: string) {
  return `cph-vet-${bookingId}`.replace(/[^a-zA-Z0-9-]/g, "");
}
