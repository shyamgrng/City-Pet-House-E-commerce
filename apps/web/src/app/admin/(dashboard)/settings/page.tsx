"use client";

import { useState } from "react";
import { paymentMethods } from "@/lib/admin-data";
import { siteSettings } from "@/lib/site-settings";

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="text-xs text-[#5B6773] mb-1.5">{label}</div>
      <input defaultValue={defaultValue} className="w-full border border-[#E4E9EC] rounded-lg px-3 py-2.5 text-[13px]" />
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-4 max-w-xl">
      <div className="text-[13px] font-bold text-[#1A2027] mb-1">{title}</div>
      {subtitle && <div className="text-xs text-[#8A96A3] mb-3">{subtitle}</div>}
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [methods] = useState(paymentMethods);

  return (
    <div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-4">Settings</div>

      <Card title="Business Info">
        <Field label="Business Name" defaultValue={siteSettings.businessName} />
        <Field label="Support Phone" defaultValue={siteSettings.phone} />
      </Card>

      <Card title="Header & Footer" subtitle="Applies to: the info strip at the top of every page and the Contact Us block in the footer.">
        <Field label="Address" defaultValue={siteSettings.address} />
        <Field label="Support Email" defaultValue={siteSettings.email} />
        <Field label="Opening Hours" defaultValue={siteSettings.hours} />
      </Card>

      <Card title="Social Links" subtitle="Applies to: the social icons in the footer.">
        <Field label="Facebook URL" />
        <Field label="Instagram URL" />
        <Field label="TikTok URL" />
        <Field label="YouTube URL" />
      </Card>

      <Card title="App Download Links" subtitle='Applies to: the two "Download the app" badges in the footer.'>
        <div className="text-xs font-bold text-[#1A2027] mb-1.5">Vaccination Record App</div>
        <Field label="App Store URL" />
        <Field label="Google Play URL" />
        <div className="text-xs font-bold text-[#1A2027] mb-1.5 mt-3">Happy Shopping App</div>
        <Field label="App Label" defaultValue={siteSettings.shoppingAppLabel} />
        <Field label="App Store URL" />
        <Field label="Google Play URL" />
      </Card>

      <Card title="Delivery">
        <Field label="Standard Delivery Fee (Rs.)" defaultValue="100" />
        <Field label="Puppy Delivery Fee (Rs.)" defaultValue="250" />
      </Card>

      <Card title="Accepted Payment Methods" subtitle="Toggle a method active/inactive and upload its QR — active methods with a QR appear at every checkout.">
        {methods.map((m) => (
          <div key={m.name} className="flex items-center justify-between py-2.5 border-b border-[#F0F2F4] last:border-0">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded bg-primary text-white flex items-center justify-center text-[11px]">✓</span>
              <span className="text-[13px] font-semibold text-[#1A2027]">{m.name}</span>
            </div>
            <div className="w-14 h-14 rounded-lg border border-dashed border-[#C7CDD3] flex items-center justify-center text-[10px] text-[#8A96A3]">
              QR
            </div>
          </div>
        ))}
      </Card>

      <button className="max-w-xl w-full bg-primary text-white font-bold text-sm py-3 rounded-lg cursor-pointer">Save Changes</button>
    </div>
  );
}
