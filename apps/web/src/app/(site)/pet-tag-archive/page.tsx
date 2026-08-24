"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import MediaSlot from "@/components/MediaSlot";
import { usePetTag } from "@/context/PetTagContext";
import { IMAGE_ACCEPT } from "@/lib/image-upload";
import { displayAge } from "@/lib/pet-age";
import type { PetTag } from "@/lib/pet-tag-types";

export default function PetTagArchivePage() {
  return (
    <Suspense fallback={null}>
      <PetTagArchiveContent />
    </Suspense>
  );
}

function PetTagArchiveContent() {
  const { content, lookupTag, recordScan, ready } = usePetTag();
  const searchParams = useSearchParams();
  const [lookup, setLookup] = useState<{ query: string; submitted: boolean; result: PetTag | null; fromScan: boolean }>({
    query: "",
    submitted: false,
    result: null,
    fromScan: false,
  });
  const autoScanned = useRef(false);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const [qrError, setQrError] = useState("");
  const [decoding, setDecoding] = useState(false);

  useEffect(() => {
    if (autoScanned.current) return;
    const tagParam = searchParams.get("tag");
    if (!tagParam || !ready) return;
    autoScanned.current = true;
    const found = lookupTag(tagParam);
    if (found) recordScan(found.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLookup({ query: tagParam, submitted: true, result: found, fromScan: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, searchParams]);

  if (!ready) return null;

  const { query, submitted, result, fromScan } = lookup;

  const lookupValue = (value: string) => {
    const found = lookupTag(value);
    if (found) recordScan(found.id);
    setLookup((s) => ({ ...s, submitted: true, result: found }));
  };

  const handleQrFile = async (file: File | undefined) => {
    if (!file) return;
    setQrError("");
    setDecoding(true);
    try {
      const jsQR = (await import("jsqr")).default;
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas context");
      ctx.drawImage(bitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (!code || !code.data) {
        setQrError("Couldn't read a QR code in that image — try a clearer photo.");
        setDecoding(false);
        return;
      }
      let tagValue = code.data;
      try {
        const u = new URL(code.data);
        tagValue = u.searchParams.get("tag") || code.data;
      } catch {
        // not a URL — use the raw decoded value as the tag code
      }
      setLookup((s) => ({ ...s, query: tagValue }));
      lookupValue(tagValue);
    } catch {
      setQrError("Couldn't process that image — try a different file.");
    } finally {
      setDecoding(false);
    }
  };

  if (result) {
    return (
      <div>
        <div style={{ background: "linear-gradient(135deg, #1996C8, #146A8C)" }} className="p-8 text-center relative">
          <Link href="/" className="absolute top-6 left-8 text-[13px] text-white font-semibold opacity-90">
            ← Back to Home
          </Link>
          <div className="text-lg text-white/85 font-bold tracking-[0.6px]">🐾 PET DETAILS</div>
        </div>

        <div className="flex justify-center px-8 pb-12">
          <div className="w-full max-w-[520px] -mt-14">
            <div className="bg-white rounded-2xl p-7 text-center mb-5" style={{ boxShadow: "0 12px 30px rgba(0,0,0,0.1)" }}>
              <div className="w-[100px] h-[100px] -mt-[72px] mb-3 mx-auto rounded-full border-[5px] border-white shadow-[0_6px_14px_rgba(0,0,0,0.14)]">
                <MediaSlot src={result.photo} label="🐾" shape="circle" className="w-full h-full" />
              </div>
              <div className="font-heading font-bold text-[22px] text-[#1A2027]">{result.petName}</div>
              <div className="text-[13px] text-[#8A96A3] mt-1">
                {result.breed} · {result.color} · {result.sex}, {displayAge(result)}
              </div>
              {result.microchip && (
                <div className="inline-block mt-3 bg-[#F0F2F4] rounded-full px-3.5 py-1.5 text-xs text-[#5B6773]">Microchip: {result.microchip}</div>
              )}
            </div>

            <div className="bg-white border border-[#E4E9EC] rounded-2xl p-6 mb-5">
              <div className="text-xs font-bold text-primary tracking-[0.5px] mb-3.5">OWNER CONTACT</div>
              <div className="text-lg font-bold text-[#1A2027] mb-3.5">{result.ownerName}</div>
              <a href={`tel:${result.phone}`} className="flex items-center gap-3 bg-[#EAF6EE] rounded-xl px-4 py-3.5 mb-2.5 no-underline">
                <div className="text-xl">📞</div>
                <div>
                  <div className="text-sm font-bold text-[#1A2027]">{result.phone}</div>
                  <div className="text-[11px] text-[#5B8F6B]">Click to call</div>
                </div>
              </a>
              {result.altPhone && (
                <a href={`tel:${result.altPhone}`} className="flex items-center gap-3 bg-[#F7F9FA] rounded-xl px-4 py-3.5 mb-2.5 no-underline">
                  <div className="text-xl">📞</div>
                  <div>
                    <div className="text-sm font-bold text-[#1A2027]">{result.altPhone}</div>
                    <div className="text-[11px] text-[#8A96A3]">Alternative number</div>
                  </div>
                </a>
              )}
              {result.address && (
                <div className="flex items-start gap-3 mt-3">
                  <div className="text-lg">📍</div>
                  <div className="text-[13px] text-[#3A4652] leading-relaxed">
                    {result.address}
                    {result.mapLink && (
                      <div>
                        <a href={result.mapLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-semibold">
                          View on Google Maps →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {result.notes && (
              <div className="bg-[#FFF8EA] border border-[#F0DFAE] rounded-2xl px-5 py-[18px] mb-5">
                <div className="text-xs font-bold text-[#6B5D2E] tracking-[0.5px] mb-1.5">📝 NOTES FOR CARE</div>
                <div className="text-[13px] text-[#6B5D2E] leading-relaxed">{result.notes}</div>
              </div>
            )}

            <div className="text-center text-xs text-[#B0B8BF]">
              Tag {result.tagId} · Registered with City Pet House · Scanned {result.scans} times
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{ background: "linear-gradient(90deg, #1996C8, #146A8C)" }}
        className="px-9 py-10 flex items-center justify-between gap-6 flex-wrap"
      >
        <div>
          <div className="font-heading font-bold text-[30px] text-white mb-1.5">{content.bannerTitle}</div>
          <div className="text-[15px] text-white/85">{content.bannerSubtitle}</div>
        </div>
        <div className="text-sm text-white/80 font-semibold tracking-[0.5px]">🐾 CITY PET HOUSE · PET TAG REGISTRY</div>
      </div>

      <div className="flex gap-10 px-8 py-11 items-start flex-wrap lg:flex-nowrap">
        <div className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-5">
          <div className="border border-[#E4E9EC] rounded-[10px] overflow-hidden">
            <div className="h-1 bg-primary" />
            <div className="p-6">
              <div className="text-[13px] font-bold text-[#1A2027] mb-3.5">Search This Archive</div>
              {fromScan ? (
                <div className="text-xs text-[#5B6773] mb-2.5">
                  Scanned tag <strong className="text-[#1A2027]">{query}</strong> — showing the pet on file.
                </div>
              ) : (
                <>
                  <input
                    ref={qrInputRef}
                    type="file"
                    accept={IMAGE_ACCEPT}
                    capture="environment"
                    onChange={(e) => {
                      handleQrFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => qrInputRef.current?.click()}
                    disabled={decoding}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer mb-2.5 disabled:opacity-60"
                  >
                    📷 {decoding ? "Reading QR code…" : "Upload QR Image"}
                  </button>
                  {qrError && <div className="text-xs text-[#D64545] mb-2.5">{qrError}</div>}
                </>
              )}
              {submitted && !result && <div className="text-xs text-[#D64545]">No pet found matching that tag code or name.</div>}
              <div className="text-xs text-[#8A96A3] leading-relaxed mt-1.5">{content.searchCaption}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-[760px] min-w-0">
          <Link href="/" className="text-[13px] text-primary font-semibold mb-4 inline-block">
            ← Back to Home
          </Link>

          <ImagePlaceholder label="Pet tag archive banner image" className="w-full h-[260px] rounded-xl mb-7" />

          {content.sections.map((sec) => (
            <div key={sec.id} className="mb-7">
              <div className="font-heading font-bold text-xl text-[#1A2027] mb-2.5">{sec.heading}</div>
              <div className="text-sm text-[#3A4652] leading-[1.8]">{sec.body}</div>
            </div>
          ))}

          <ImagePlaceholder label="Dog wearing a City Pet House QR tag" className="w-full h-[280px] rounded-xl mb-7" />

          <div className="font-heading font-bold text-[22px] text-[#146A8C] mb-3.5">FAQs about pet tags</div>
          {content.faqs.map((f) => (
            <FaqRow key={f.id} question={f.q} answer={f.a} />
          ))}
        </div>

        <ImagePlaceholder label="Vertical banner" className="hidden lg:block w-[220px] shrink-0 rounded-xl self-stretch" />
      </div>
    </div>
  );
}

function FaqRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[#E4E9EC]">
      <div onClick={() => setOpen((v) => !v)} className="flex justify-between items-center py-4 cursor-pointer">
        <div className="text-[15px] font-semibold text-[#1A2027]">{question}</div>
        <div className="w-[26px] h-[26px] rounded-full border border-[#C9CDD2] flex items-center justify-center text-sm text-[#5B6773] shrink-0">
          {open ? "−" : "+"}
        </div>
      </div>
      {open && <div className="text-[13px] text-[#5B6773] leading-relaxed pb-4">{answer}</div>}
    </div>
  );
}
