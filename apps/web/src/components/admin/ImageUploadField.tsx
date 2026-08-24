"use client";

import { useRef, useState } from "react";
import MediaSlot from "@/components/MediaSlot";
import { IMAGE_ACCEPT, isAllowedImageFile, resizeImageFile } from "@/lib/image-upload";

export default function ImageUploadField({
  value,
  onChange,
  label,
  hint,
  shape = "rect",
  height = "h-[110px]",
  circleSize = "w-[72px] h-[72px]",
  maxWidth = 1920,
  maxHeight = 900,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  label: string;
  hint?: string;
  shape?: "rect" | "circle";
  height?: string;
  circleSize?: string;
  maxWidth?: number;
  maxHeight?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (!isAllowedImageFile(file)) {
      setError("Please choose an image file (JPEG, PNG, GIF, SVG, TIFF, or RAW).");
      return;
    }
    try {
      const dataUrl = await resizeImageFile(file, maxWidth, maxHeight);
      onChange(dataUrl);
    } catch {
      setError("Could not process that image — try a different file.");
    }
  };

  return (
    <div>
      {hint && <div className="text-[11px] font-semibold text-[#8A96A3] mb-2">{hint}</div>}
      <div
        className={`relative ${shape === "circle" ? `${circleSize} rounded-full mx-auto` : `${height} rounded-lg`} overflow-hidden mb-2.5`}
      >
        <MediaSlot src={value} label={label} shape={shape} className="absolute inset-0 w-full h-full" />
      </div>
      <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      <div className="flex gap-3 justify-center">
        <button type="button" onClick={() => inputRef.current?.click()} className="text-[11px] font-semibold text-primary cursor-pointer">
          {value ? "Replace" : "Upload Image"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-[11px] font-semibold text-[#D64545] cursor-pointer">
            Remove
          </button>
        )}
      </div>
      {error && <div className="text-[11px] text-[#D64545] mt-1 text-center">{error}</div>}
    </div>
  );
}
