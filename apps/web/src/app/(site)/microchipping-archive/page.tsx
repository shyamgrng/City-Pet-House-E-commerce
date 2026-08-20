"use client";

import Link from "next/link";
import { useState } from "react";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { useB2BAuth } from "@/context/B2BAuthContext";
import { useDoctorAuth } from "@/context/DoctorAuthContext";
import { microchipAddress, useMicrochip } from "@/context/MicrochipContext";
import type { MicrochipRecord } from "@/lib/microchip-types";

export default function MicrochippingArchivePage() {
  const { content, lookupRecord, ready } = useMicrochip();
  const { doctor, ready: doctorReady } = useDoctorAuth();
  const { supplier, ready: b2bReady } = useB2BAuth();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<MicrochipRecord | null>(null);

  if (!ready || !doctorReady || !b2bReady) return null;

  const accessAllowed = !!doctor || !!supplier;

  if (!accessAllowed) {
    return (
      <div className="text-center max-w-[520px] mx-auto py-[60px] px-8">
        <div className="text-[40px] mb-4">🔒</div>
        <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-2.5">Restricted — Authorized Access Only</div>
        <div className="text-[13px] text-[#5B6773] leading-relaxed mb-[22px]">
          Microchip records contain private owner &amp; pet details. Only signed-in B2B suppliers or doctors can look up a microchip number.
        </div>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <Link href="/b2b/login" className="bg-primary text-white px-5 py-2.5 rounded-[9px] text-[13px] font-semibold">
            Sign In as B2B Supplier
          </Link>
          <Link href="/doctor/login" className="bg-primary text-white px-5 py-2.5 rounded-[9px] text-[13px] font-semibold">
            Sign In as Doctor
          </Link>
          <Link href="/" className="border border-[#E4E9EC] text-[#5B6773] px-5 py-2.5 rounded-[9px] text-[13px] font-semibold">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const submit = () => {
    setResult(lookupRecord(query));
    setSubmitted(true);
  };

  if (result) {
    const address = microchipAddress(result);
    return (
      <div>
        <div style={{ background: "linear-gradient(135deg, #7A56C8, #4E3A8A)" }} className="p-8 text-center relative">
          <Link href="/" className="absolute top-6 left-8 text-[13px] text-white font-semibold opacity-90">
            ← Back to Home
          </Link>
          <div className="text-xs text-white/85 font-bold tracking-[0.6px]">💠 CITY PET HOUSE · MICROCHIP RECORD</div>
        </div>

        <div className="flex justify-center px-8 pb-12">
          <div className="w-full max-w-[520px] -mt-14">
            <div className="bg-white rounded-2xl p-7 text-center mb-5" style={{ boxShadow: "0 12px 30px rgba(0,0,0,0.1)" }}>
              <div className="w-[100px] h-[100px] -mt-[72px] mb-3 mx-auto rounded-full border-[5px] border-white shadow-[0_6px_14px_rgba(0,0,0,0.14)]">
                <ImagePlaceholder label="🐾" shape="circle" className="w-full h-full" />
              </div>
              <div className="font-heading font-bold text-[22px] text-[#1A2027]">{result.petName}</div>
              <div className="text-[13px] text-[#8A96A3] mt-1">
                {result.breed} · {result.color} · {result.sex}, {result.age}
              </div>
              <div className="inline-block mt-3 bg-[#F3EEFB] rounded-full px-3.5 py-1.5 text-xs text-[#5B3FA0] font-semibold">
                Microchip: {result.mcNumber}
              </div>
            </div>

            <div className="bg-white border border-[#E4E9EC] rounded-2xl p-6 mb-5">
              <div className="text-xs font-bold text-[#7A56C8] tracking-[0.5px] mb-3.5">OWNER CONTACT</div>
              <div className="text-lg font-bold text-[#1A2027] mb-3.5">{result.ownerName}</div>
              <a href={`tel:${result.phone}`} className="flex items-center gap-3 bg-[#F3EEFB] rounded-xl px-4 py-3.5 mb-2.5 no-underline">
                <div className="text-xl">📞</div>
                <div>
                  <div className="text-sm font-bold text-[#1A2027]">{result.phone}</div>
                  <div className="text-[11px] text-[#7A56C8]">Click to call</div>
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
              {address && (
                <div className="flex items-start gap-3 mt-3">
                  <div className="text-lg">📍</div>
                  <div className="text-[13px] text-[#3A4652] leading-relaxed">
                    {address}
                    {result.mapLink && (
                      <div>
                        <a href={result.mapLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[#7A56C8] font-semibold">
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

            <div className="text-center text-xs text-[#B0B8BF]">Microchip {result.mcNumber} · Registered with City Pet House</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{ background: "linear-gradient(90deg, #7A56C8, #4E3A8A)" }}
        className="px-9 py-10 flex items-center justify-between gap-6 flex-wrap"
      >
        <div>
          <div className="font-heading font-bold text-[30px] text-white mb-1.5">{content.bannerTitle}</div>
          <div className="text-[15px] text-white/85">{content.bannerSubtitle}</div>
        </div>
        <div className="text-sm text-white/80 font-semibold tracking-[0.5px]">💠 CITY PET HOUSE · MICROCHIP REGISTRY</div>
      </div>

      <div className="flex gap-10 px-8 py-11 items-start flex-wrap lg:flex-nowrap">
        <div className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-5">
          <div className="border border-[#E4E9EC] rounded-[10px] overflow-hidden">
            <div className="h-1 bg-[#7A56C8]" />
            <div className="p-6">
              <div className="text-[13px] font-bold text-[#1A2027] mb-3.5">Search This Archive</div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Microchip number or pet name"
                className="w-full box-border px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-2.5"
              />
              <button onClick={submit} className="w-full bg-[#7A56C8] text-white text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer mb-2.5">
                Search
              </button>
              {submitted && !result && <div className="text-xs text-[#D64545]">No pet found matching that microchip number or name.</div>}
              <div className="text-xs text-[#8A96A3] leading-relaxed mt-1.5">{content.searchCaption}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-[760px] min-w-0">
          <Link href="/" className="text-[13px] text-primary font-semibold mb-4 inline-block">
            ← Back to Home
          </Link>

          <ImagePlaceholder label="Microchipping archive banner image" className="w-full h-[260px] rounded-xl mb-7" />

          {content.sections.map((sec) => (
            <div key={sec.id} className="mb-7">
              <div className="font-heading font-bold text-xl text-[#1A2027] mb-2.5">{sec.heading}</div>
              <div className="text-sm text-[#3A4652] leading-[1.8]">{sec.body}</div>
            </div>
          ))}

          <ImagePlaceholder label="Vet scanning a pet's microchip" className="w-full h-[280px] rounded-xl mb-7" />

          <div className="font-heading font-bold text-[22px] text-[#D2691E] mb-3.5">FAQs about microchipping</div>
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
