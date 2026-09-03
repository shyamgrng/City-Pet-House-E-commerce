"use client";

import { useRef } from "react";
import { DOCUMENT_UPLOAD_ACCEPT, IMAGE_ACCEPT } from "@/lib/image-upload";

export function RegField({
  label,
  required,
  value,
  onChange,
  placeholder,
  mb = "mb-3",
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mb?: string;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">
        {label} {required && <span className="text-[#D64545]">*</span>}
      </div>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border ${mb}`}
      />
    </div>
  );
}

export function PhotoDrop({
  label,
  dropLabel = "Photo",
  required,
  value,
  fileName,
  error,
  busy,
  onFile,
  mb = "mb-3",
}: {
  label: string;
  dropLabel?: string;
  required?: boolean;
  value: string;
  fileName?: string;
  error?: string;
  busy?: boolean;
  onFile: (file: File | undefined) => void;
  mb?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={mb}>
      <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">
        {label} {required && <span className="text-[#D64545]">*</span>}
      </div>
      <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      {busy ? (
        <div className="w-full h-[90px] rounded-lg border border-dashed border-[#C7CDD3] bg-[#F7F9FA] flex items-center justify-center">
          <div className="text-[11px] font-semibold text-[#5B6773]">Processing photo…</div>
        </div>
      ) : value ? (
        <div onClick={() => inputRef.current?.click()} className="cursor-pointer border border-[#E4E9EC] rounded-lg p-2 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="w-14 h-14 object-cover rounded-md border border-[#E4E9EC] shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-[#1A2027] truncate">{fileName || "Photo attached"}</div>
            <div className="text-[10px] text-primary underline mt-0.5">Replace</div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full h-[90px] rounded-lg border border-dashed border-[#C7CDD3] bg-[#F7F9FA] flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-[#5B6773]">{dropLabel}</div>
          <div className="text-[10px] text-primary underline">or browse files</div>
        </div>
      )}
      {error && <div className="text-[11px] text-[#D64545] mt-1">{error}</div>}
    </div>
  );
}

/** Same as PhotoDrop, but also accepts a PDF or Word document -- a photo of a document, a PDF
 * scan, and the original Word file are all common ways people have their business/ID documents
 * saved. A PDF/Word file is stored as just its filename (no reliable in-browser thumbnail for
 * either), an image is resized and previewed. */
export function DocDrop({
  label,
  dropLabel = "Photo",
  required,
  value,
  fileName,
  error,
  busy,
  onFile,
  mb = "mb-3",
}: {
  label: string;
  dropLabel?: string;
  required?: boolean;
  value: string;
  fileName?: string;
  error?: string;
  busy?: boolean;
  onFile: (file: File | undefined) => void;
  mb?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDoc = value.startsWith("DOC:");
  const docExt = isDoc ? (value.slice(4).split(".").pop() ?? "").slice(0, 4).toUpperCase() : "";
  return (
    <div className={mb}>
      <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">
        {label} {required && <span className="text-[#D64545]">*</span>}
      </div>
      <input ref={inputRef} type="file" accept={DOCUMENT_UPLOAD_ACCEPT} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      {busy ? (
        <div className="w-full h-[90px] rounded-lg border border-dashed border-[#C7CDD3] bg-[#F7F9FA] flex items-center justify-center">
          <div className="text-[11px] font-semibold text-[#5B6773]">Processing…</div>
        </div>
      ) : value && !isDoc ? (
        <div onClick={() => inputRef.current?.click()} className="cursor-pointer border border-[#E4E9EC] rounded-lg p-2 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="w-14 h-14 object-cover rounded-md border border-[#E4E9EC] shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-[#1A2027] truncate">{fileName || "Photo attached"}</div>
            <div className="text-[10px] text-primary underline mt-0.5">Replace</div>
          </div>
        </div>
      ) : value && isDoc ? (
        <div onClick={() => inputRef.current?.click()} className="cursor-pointer border border-[#E4E9EC] rounded-lg p-2 flex items-center gap-3">
          <div className="w-14 h-14 rounded-md bg-[#EEF1F3] flex items-center justify-center text-[10px] font-bold text-[#5B6773] shrink-0">
            {docExt}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-[#1A2027] truncate">{value.slice(4)}</div>
            <div className="text-[10px] text-primary underline mt-0.5">Replace</div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full h-[90px] rounded-lg border border-dashed border-[#C7CDD3] bg-[#F7F9FA] flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-[#5B6773]">{dropLabel}</div>
          <div className="text-[10px] text-primary underline">photo, PDF, or Word — browse files</div>
        </div>
      )}
      {error && <div className="text-[11px] text-[#D64545] mt-1">{error}</div>}
    </div>
  );
}

export function FileDrop({
  label,
  fileName,
  accept,
  onFile,
  mb = "mb-3",
}: {
  label: string;
  fileName: string;
  accept: string;
  onFile: (file: File | undefined) => void;
  mb?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={mb}>
      <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">{label}</div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full h-[90px] rounded-lg border border-dashed border-[#C7CDD3] bg-[#F7F9FA] flex flex-col items-center justify-center cursor-pointer px-2 text-center"
      >
        <div className="text-[11px] font-semibold text-[#5B6773] truncate max-w-full">{fileName || label}</div>
        <div className="text-[10px] text-primary underline">or browse files</div>
      </div>
    </div>
  );
}
