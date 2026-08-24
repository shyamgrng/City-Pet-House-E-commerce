"use client";

import { useRef, useState } from "react";
import MediaSlot from "@/components/MediaSlot";
import { IMAGE_ACCEPT, isAllowedImageFile, resizeImageFile } from "@/lib/image-upload";
import ImageCropModal from "./ImageCropModal";

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
  crop = false,
  alt,
  onAltChange,
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
  /** When true, opens a crop + alt-text editor instead of auto-resizing the picked file. */
  crop?: boolean;
  alt?: string;
  onAltChange?: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const saveDataUrl = (dataUrl: string) => {
    try {
      onChange(dataUrl);
    } catch {
      setError("Couldn't save — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.");
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (!isAllowedImageFile(file)) {
      setError("Please choose an image file (JPEG, PNG, GIF, SVG, TIFF, or RAW).");
      return;
    }
    if (crop) {
      setPendingFile(file);
      return;
    }
    let dataUrl: string;
    try {
      dataUrl = await resizeImageFile(file, maxWidth, maxHeight);
    } catch {
      setError("Could not process that image — try a different file.");
      return;
    }
    saveDataUrl(dataUrl);
  };

  const handleCropConfirm = (dataUrl: string, newAlt: string) => {
    setPendingFile(null);
    onAltChange?.(newAlt);
    saveDataUrl(dataUrl);
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
      {crop && value && onAltChange && (
        <input
          value={alt || ""}
          onChange={(e) => onAltChange(e.target.value)}
          placeholder="Alt text"
          className="w-full mt-2 px-2.5 py-1.5 rounded-md border border-[#E4E9EC] text-[11px] box-border"
        />
      )}
      {error && <div className="text-[11px] text-[#D64545] mt-1 text-center">{error}</div>}
      {pendingFile && (
        <ImageCropModal
          file={pendingFile}
          initialAlt={alt || ""}
          onCancel={() => setPendingFile(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}
