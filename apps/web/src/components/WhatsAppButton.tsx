"use client";

import { useState } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function WhatsAppButton() {
  const [hover, setHover] = useState(false);
  const { settings } = useSiteSettings();
  const digits = settings.phone.replace(/\D/g, "");
  const message = "Hi City Pet House! I'd like to ask about...";
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="Chat with City Pet House on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5"
    >
      {hover && (
        <div className="bg-white text-[#1A2027] text-[13px] font-semibold px-3.5 py-2.5 rounded-lg shadow-[0_4px_14px_rgba(0,0,0,0.15)] whitespace-nowrap">
          Chat with us on WhatsApp
        </div>
      )}
      <div className="w-14 h-14 rounded-full bg-[#25D366] shadow-[0_4px_14px_rgba(0,0,0,0.25)] flex items-center justify-center shrink-0">
        <svg viewBox="0 0 32 32" className="w-8 h-8" fill="#fff">
          <path d="M16.004 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.256.594 4.428 1.72 6.35L3.2 28.8l6.62-1.687a12.74 12.74 0 0 0 6.184 1.575h.005c7.07 0 12.8-5.73 12.8-12.8s-5.73-12.8-12.805-12.8zm0 23.36a10.5 10.5 0 0 1-5.36-1.47l-.384-.228-3.93 1.002 1.05-3.83-.25-.393a10.53 10.53 0 0 1-1.626-5.64c0-5.83 4.744-10.573 10.578-10.573 2.826 0 5.48 1.1 7.478 3.1a10.5 10.5 0 0 1 3.094 7.475c0 5.83-4.744 10.556-10.65 10.556zm5.8-7.912c-.317-.16-1.878-.928-2.17-1.033-.29-.107-.502-.16-.714.16-.212.318-.82 1.033-1.006 1.245-.185.212-.37.238-.687.08-.317-.16-1.338-.494-2.548-1.575-.942-.84-1.578-1.878-1.763-2.196-.185-.318-.02-.49.14-.65.143-.142.318-.37.477-.556.16-.185.212-.318.318-.53.106-.212.053-.397-.027-.556-.08-.16-.714-1.723-.98-2.36-.258-.62-.52-.535-.714-.546-.185-.01-.397-.01-.608-.01a1.17 1.17 0 0 0-.847.397c-.29.318-1.11 1.086-1.11 2.65s1.137 3.072 1.296 3.284c.16.212 2.24 3.42 5.43 4.796.758.327 1.35.523 1.812.67.762.243 1.454.208 2.002.126.61-.09 1.878-.768 2.144-1.51.265-.74.265-1.375.185-1.51-.08-.133-.29-.212-.608-.37z" />
        </svg>
      </div>
    </a>
  );
}
