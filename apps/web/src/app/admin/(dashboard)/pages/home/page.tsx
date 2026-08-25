"use client";

import Link from "next/link";
import { useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { useBrand } from "@/context/BrandContext";
import { useHomeContent } from "@/context/HomeContentContext";
import { categories } from "@/lib/home-data";

export default function AdminHomePage() {
  const { content, ready, update, setCategoryImage, setBrandImage } = useHomeContent();
  const { brands } = useBrand();
  const [saved, setSaved] = useState(false);

  if (!ready) return null;

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const metaLen = content.metaDescription.length;
  const metaColor = metaLen >= 120 && metaLen <= 160 ? "#1F7A4D" : "#C9962B";

  return (
    <div className="max-w-[640px]">
      <Link href="/admin/pages" className="text-xs font-semibold text-primary cursor-pointer mb-2.5 inline-block">
        ← Pages
      </Link>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-[18px]">Home Page</div>

      <SectionLabel>Hero Banner</SectionLabel>
      <Card>
        <ImageUploadField
          value={content.heroImage}
          onChange={(v) => update({ heroImage: v })}
          label="cover photo — shop & clinic"
          hint="Recommended size: 1920×600px, JPG/WEBP under 500KB."
          height="h-[160px]"
          maxWidth={1920}
          maxHeight={600}
        />
        <Label>Headline</Label>
        <Input value={content.heroHeadline} onChange={(v) => update({ heroHeadline: v })} />
        <Label>Subtext</Label>
        <Input value={content.heroSubtext} onChange={(v) => update({ heroSubtext: v })} last />
      </Card>

      <SectionLabel>Secondary Banners</SectionLabel>
      <div className="grid grid-cols-2 gap-3.5 mb-5">
        <Card>
          <ImageUploadField
            value={content.banner1Image}
            onChange={(v) => update({ banner1Image: v })}
            label="promo — hot sale, shop deals"
            hint="Promo Banner 1 — 600×280px"
            height="h-[110px]"
            maxWidth={600}
            maxHeight={280}
          />
          <Label>Banner Text</Label>
          <Input value={content.banner1Text} onChange={(v) => update({ banner1Text: v })} last />
        </Card>
        <Card>
          <ImageUploadField
            value={content.banner2Image}
            onChange={(v) => update({ banner2Image: v })}
            label="promo — vet consult booking"
            hint="Promo Banner 2 — 600×280px"
            height="h-[110px]"
            maxWidth={600}
            maxHeight={280}
          />
          <Label>Banner Text</Label>
          <Input value={content.banner2Text} onChange={(v) => update({ banner2Text: v })} last />
        </Card>
      </div>

      <SectionLabel>SEO / Meta</SectionLabel>
      <Card>
        <Label>Meta Title</Label>
        <Input value={content.metaTitle} onChange={(v) => update({ metaTitle: v })} />
        <Label>Meta Description</Label>
        <textarea
          value={content.metaDescription}
          onChange={(e) => update({ metaDescription: e.target.value })}
          rows={3}
          className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs resize-y font-sans mb-1"
        />
        <div className="text-[11px]" style={{ color: metaColor }}>
          {metaLen} characters — best practice is 120–160 characters
        </div>
      </Card>

      <SectionLabel hint="Recommended image size: 300×300px (square).">Animal Picture Row</SectionLabel>
      <div className="grid grid-cols-5 gap-2.5 mb-5">
        {categories.map((c) => (
          <div key={c.slug} className="bg-white border border-[#E4E9EC] rounded-[10px] p-2.5 text-center">
            <ImageUploadField
              value={content.categoryImages[c.name] ?? ""}
              onChange={(v) => setCategoryImage(c.name, v)}
              label={c.name}
              shape="circle"
              circleSize="w-[64px] h-[64px]"
              maxWidth={300}
              maxHeight={300}
            />
            <div className="text-[11px] font-semibold text-[#1A2027] mt-1">{c.name}</div>
          </div>
        ))}
      </div>

      <SectionLabel hint="Recommended image size: 250×250px (square).">Shop by Brand</SectionLabel>
      <div className="grid grid-cols-4 gap-2.5 mb-5">
        {brands.map((b) => (
          <div key={b} className="bg-white border border-[#E4E9EC] rounded-[10px] p-2.5 text-center">
            <ImageUploadField
              value={content.brandImages[b] ?? ""}
              onChange={(v) => setBrandImage(b, v)}
              label={b}
              shape="circle"
              circleSize="w-[56px] h-[56px]"
              maxWidth={250}
              maxHeight={250}
            />
            <div className="text-[10px] font-semibold text-[#1A2027] mt-1 truncate">{b}</div>
          </div>
        ))}
      </div>

      <SectionLabel hint="The long promo banner between Today's Deals and Pet Food. Recommended size: 1400×240px.">
        Hot Sales Banner
      </SectionLabel>
      <Card>
        <ImageUploadField
          value={content.hotSaleBannerImage}
          onChange={(v) => update({ hotSaleBannerImage: v })}
          label="banner"
          height="h-[90px]"
          maxWidth={1400}
          maxHeight={240}
        />
        <Label>Text</Label>
        <Input value={content.hotSaleBannerText} onChange={(v) => update({ hotSaleBannerText: v })} last />
      </Card>

      <SectionLabel hint='The "Book Now" banner above Our Services. Recommended size: 1400×240px.'>Microchipping Banner</SectionLabel>
      <Card>
        <ImageUploadField
          value={content.microchipBannerImage}
          onChange={(v) => update({ microchipBannerImage: v })}
          label="banner — pet microchipping"
          height="h-[90px]"
          maxWidth={1400}
          maxHeight={240}
        />
        <Label>Text</Label>
        <Input value={content.microchipBannerText} onChange={(v) => update({ microchipBannerText: v })} last />
      </Card>

      <SectionLabel hint="The delivery-coverage strip above Shop by Brand. Recommended size: 1400×240px.">Delivery Banner</SectionLabel>
      <Card>
        <ImageUploadField
          value={content.deliveryBannerImage}
          onChange={(v) => update({ deliveryBannerImage: v })}
          label="delivery banner"
          height="h-[90px]"
          maxWidth={1400}
          maxHeight={240}
        />
        <Label>Text</Label>
        <Input value={content.deliveryBannerText} onChange={(v) => update({ deliveryBannerText: v })} last />
      </Card>

      <SectionLabel hint='The large "Book Now" banner near the bottom of Home. Recommended size: 1800×540px.'>Dog Grooming Banner</SectionLabel>
      <Card>
        <ImageUploadField
          value={content.groomingBannerImage}
          onChange={(v) => update({ groomingBannerImage: v })}
          label="big banner — dog grooming services"
          height="h-[160px]"
          maxWidth={1800}
          maxHeight={540}
        />
        <Label>Text</Label>
        <Input value={content.groomingBannerText} onChange={(v) => update({ groomingBannerText: v })} last />
      </Card>

      <button onClick={save} className="w-full bg-primary text-white text-center py-3.5 rounded-[9px] text-sm font-semibold cursor-pointer mt-2">
        Update Website
      </button>
      {saved && <div className="text-xs text-[#1F7A4D] mt-2.5 text-center">✓ Changes are live on the website</div>}
    </div>
  );
}

function SectionLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2.5">
      <div className="text-xs font-bold text-[#1A2027]">{children}</div>
      {hint && <div className="text-[11px] text-[#8A96A3] mt-0.5">{hint}</div>}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 mb-5">{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold text-[#3A4652] mb-1.5">{children}</div>;
}

function Input({ value, onChange, last = false }: { value: string; onChange: (v: string) => void; last?: boolean }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs ${last ? "" : "mb-3"}`}
    />
  );
}
