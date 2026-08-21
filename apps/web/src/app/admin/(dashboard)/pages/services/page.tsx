"use client";

import Link from "next/link";
import { useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { useServices } from "@/context/ServiceContext";
import type { Service } from "@/lib/service-types";

export default function AdminServicesPage() {
  const { services, updateService, deleteService, addService } = useServices();
  const [saved, setSaved] = useState(false);

  const patch = (svc: Service, fields: Partial<Omit<Service, "id">>) => {
    const { id, ...rest } = svc;
    updateService(id, { ...rest, ...fields });
  };

  const updateWebsite = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAdd = () => {
    addService({
      name: "New Service",
      photo: "",
      desc: "Short description",
      seoTitle: "New Service",
      metaDescription: "Short description",
      longDesc: "Details coming soon.",
      benefits: [],
      duration: "—",
      price: "",
    });
  };

  return (
    <div className="max-w-[640px]">
      <Link href="/admin/pages" className="text-xs font-semibold text-primary cursor-pointer mb-2.5 inline-block">
        ← Pages
      </Link>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1.5">Services</div>
      <div className="text-xs text-[#5B6773] mb-[18px]">
        One block per service — this photo, name, description &amp; details update the Home &quot;Our Services&quot; cards, the Services
        page card, and that service&apos;s own detail page together. Recommended photo size: 800×450px.
      </div>

      {services.map((svc) => (
        <div key={svc.id} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 mb-3 flex gap-3.5">
          <div className="w-[120px] shrink-0">
            <ImageUploadField
              value={svc.photo}
              onChange={(v) => patch(svc, { photo: v })}
              label="service photo"
              height="h-[90px]"
              maxWidth={800}
              maxHeight={450}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="text-[10px] font-bold text-[#8A96A3] mb-1">SERVICE NAME (shown on Home, Services list &amp; detail page)</div>
              <div onClick={() => deleteService(svc.id)} className="text-[11px] font-semibold text-[#D64545] cursor-pointer whitespace-nowrap ml-2.5">
                Delete
              </div>
            </div>
            <Input value={svc.name} onChange={(v) => patch(svc, { name: v })} />

            <Label>SHORT DESCRIPTION (Home &amp; Services list card)</Label>
            <Input value={svc.desc} onChange={(v) => patch(svc, { desc: v })} />

            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <Label>PRICE / NOTE</Label>
                <Input value={svc.price} onChange={(v) => patch(svc, { price: v })} mb="" />
              </div>
              <div className="flex-1">
                <Label>DURATION</Label>
                <Input value={svc.duration} onChange={(v) => patch(svc, { duration: v })} mb="" />
              </div>
            </div>

            <Label>HEADING (detail page title)</Label>
            <Input value={svc.seoTitle} onChange={(v) => patch(svc, { seoTitle: v })} />

            <Label>META DESCRIPTION (SEO, not shown on page)</Label>
            <Input value={svc.metaDescription} onChange={(v) => patch(svc, { metaDescription: v })} />

            <Label>FULL DESCRIPTION (detail page paragraph)</Label>
            <textarea
              value={svc.longDesc}
              onChange={(e) => patch(svc, { longDesc: e.target.value })}
              rows={4}
              className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs mb-2 resize-y font-sans"
            />

            <Label>BENEFITS (separate with | — detail page)</Label>
            <Input
              value={svc.benefits.join(" | ")}
              onChange={(v) =>
                patch(svc, {
                  benefits: v
                    .split("|")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              mb=""
            />

            {svc.schedule !== undefined && (
              <>
                <div className="text-[10px] font-bold text-[#8A96A3] mt-3 mb-1.5">VACCINATION SCHEDULE (detail page table)</div>
                {svc.schedule.map((row, i) => (
                  <div key={i} className="flex gap-1.5 mb-1.5 items-center">
                    <input
                      value={row.age}
                      placeholder="Age"
                      onChange={(e) => {
                        const schedule = svc.schedule!.map((r, ri) => (ri === i ? { ...r, age: e.target.value } : r));
                        patch(svc, { schedule });
                      }}
                      className="flex-none w-[140px] box-border h-[30px] rounded-md border border-[#E4E9EC] px-2.5 text-xs"
                    />
                    <input
                      value={row.vaccine}
                      placeholder="Vaccine"
                      onChange={(e) => {
                        const schedule = svc.schedule!.map((r, ri) => (ri === i ? { ...r, vaccine: e.target.value } : r));
                        patch(svc, { schedule });
                      }}
                      className="flex-1 box-border h-[30px] rounded-md border border-[#E4E9EC] px-2.5 text-xs"
                    />
                    <div
                      onClick={() => patch(svc, { schedule: svc.schedule!.filter((_, ri) => ri !== i) })}
                      className="text-[11px] text-[#D64545] font-semibold cursor-pointer whitespace-nowrap"
                    >
                      Remove
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => patch(svc, { schedule: [...svc.schedule!, { age: "", vaccine: "" }] })}
                  className="text-[11px] font-semibold text-primary cursor-pointer"
                >
                  + Add Row
                </div>
              </>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className="w-full border border-dashed border-primary text-primary text-center py-3 rounded-[10px] text-xs font-semibold cursor-pointer mb-5"
      >
        + Add Service
      </button>

      <button onClick={updateWebsite} className="w-full bg-primary text-white text-center py-3.5 rounded-[9px] text-sm font-semibold cursor-pointer">
        Update Website
      </button>
      {saved && <div className="text-xs text-[#1F7A4D] mt-2.5 text-center">✓ Changes are live on the website</div>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-bold text-[#8A96A3] mb-1">{children}</div>;
}

function Input({ value, onChange, mb = "mb-2" }: { value: string; onChange: (v: string) => void; mb?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full box-border h-8 rounded-md border border-[#E4E9EC] px-2.5 text-xs ${mb}`}
    />
  );
}
