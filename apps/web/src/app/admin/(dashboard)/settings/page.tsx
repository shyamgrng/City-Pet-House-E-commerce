"use client";

import { useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { useDeliverySettings } from "@/context/DeliverySettingsContext";
import { usePaymentMethods } from "@/context/PaymentMethodsContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import type { SiteSettings } from "@/lib/site-settings";

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="text-xs text-[#5B6773] mb-1.5">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-[#E4E9EC] rounded-lg px-3 py-2.5 text-[13px]" />
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
  const { settings, updateSettings, ready: settingsReady } = useSiteSettings();
  const {
    standardFeeSmall,
    standardFeeMedium,
    standardFeeLarge,
    standardFeeVeryLarge,
    puppyFee,
    feeTiers,
    freeDeliveryMaxTier,
    setSettings: setDeliverySettings,
    ready: deliveryReady,
  } = useDeliverySettings();
  const { methods, toggleMethod, setQr, setBankDetails, ready: methodsReady } = usePaymentMethods();
  const [saved, setSaved] = useState(false);

  if (!settingsReady || !deliveryReady || !methodsReady) return null;

  const set = (patch: Partial<SiteSettings>) => {
    updateSettings(patch);
    setSaved(false);
  };

  const setPuppyFee = (v: number) => {
    setDeliverySettings({ standardFeeSmall, standardFeeMedium, standardFeeLarge, standardFeeVeryLarge, puppyFee: v, feeTiers, freeDeliveryMaxTier });
    setSaved(false);
  };

  return (
    <div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-4">Settings</div>

      <Card title="Business Info">
        <Field label="Business Name" value={settings.businessName} onChange={(v) => set({ businessName: v })} />
        <Field label="Support Phone" value={settings.phone} onChange={(v) => set({ phone: v })} />
      </Card>

      <Card title="Header & Footer" subtitle="Applies to: the info strip at the top of every page and the Contact Us block in the footer.">
        <Field label="Address" value={settings.address} onChange={(v) => set({ address: v })} />
        <Field label="Support Email" value={settings.email} onChange={(v) => set({ email: v })} />
        <Field label="Opening Hours" value={settings.hours} onChange={(v) => set({ hours: v })} />
      </Card>

      <Card title="Social Links" subtitle="Applies to: the social icons in the footer.">
        <Field label="Facebook URL" value={settings.facebook} onChange={(v) => set({ facebook: v })} />
        <Field label="Instagram URL" value={settings.instagram} onChange={(v) => set({ instagram: v })} />
        <Field label="TikTok URL" value={settings.tiktok} onChange={(v) => set({ tiktok: v })} />
        <Field label="YouTube URL" value={settings.youtube} onChange={(v) => set({ youtube: v })} />
      </Card>

      <Card title="App Download Links" subtitle='Applies to: the two "Download the app" badges in the footer.'>
        <div className="text-xs font-bold text-[#1A2027] mb-1.5">Vaccination Record App</div>
        <Field label="App Store URL" value={settings.vaccinationAppStoreUrl} onChange={(v) => set({ vaccinationAppStoreUrl: v })} />
        <Field label="Google Play URL" value={settings.vaccinationGooglePlayUrl} onChange={(v) => set({ vaccinationGooglePlayUrl: v })} />
        <div className="text-xs font-bold text-[#1A2027] mb-1.5 mt-3">Happy Shopping App</div>
        <Field label="App Label" value={settings.shoppingAppLabel} onChange={(v) => set({ shoppingAppLabel: v })} />
        <Field label="App Store URL" value={settings.shoppingAppStoreUrl} onChange={(v) => set({ shoppingAppStoreUrl: v })} />
        <Field label="Google Play URL" value={settings.shoppingGooglePlayUrl} onChange={(v) => set({ shoppingGooglePlayUrl: v })} />
      </Card>

      <Card
        title="Delivery"
        subtitle="Customer delivery fees (by size, plus subtotal-value discount tiers) and courier cost rates are set separately in Shop → Delivery Setting."
      >
        <Field label="Puppy Delivery Fee (Rs.)" value={String(puppyFee)} onChange={(v) => setPuppyFee(Number(v) || 0)} />
      </Card>

      <Card
        title="Accepted Payment Methods"
        subtitle="Toggle a method active/inactive — active methods appear at checkout. Fonepay generates a live QR with the exact amount automatically (needs FONEPAY_* env vars in Vercel); other QR methods use an uploaded QR image (recommended 500×500px) with the amount shown as text next to it."
      >
        {methods.map((m) => (
          <div key={m.key} className="flex items-start gap-3.5 py-3 border-b border-[#F0F2F4] last:border-0">
            <button
              type="button"
              onClick={() => {
                toggleMethod(m.key);
                setSaved(false);
              }}
              className="w-5 h-5 mt-0.5 rounded-[5px] border flex items-center justify-center text-[13px] text-white shrink-0 cursor-pointer"
              style={{ background: m.active ? "#1996C8" : "#fff", borderColor: "#C7CDD3" }}
            >
              {m.active ? "✓" : ""}
            </button>
            <div className="text-[13px] font-semibold text-[#1A2027] flex-1 pt-0.5">{m.label}</div>

            {m.kind === "dynamic-qr" && (
              <div className="w-52 shrink-0 text-[11px] text-[#8A96A3]">
                Live QR via Fonepay&apos;s API — no upload needed. Set FONEPAY_MERCHANT_CODE, FONEPAY_USERNAME, FONEPAY_PASSWORD and
                FONEPAY_SECRET_KEY in Vercel to enable.
              </div>
            )}

            {m.kind === "static-qr" && (
              <div className="w-28 shrink-0">
                <ImageUploadField
                  value={m.qrImage}
                  onChange={(v) => {
                    setQr(m.key, v);
                    setSaved(false);
                  }}
                  label="QR"
                  shape="rect"
                  height="h-16"
                  maxWidth={500}
                  maxHeight={500}
                />
              </div>
            )}

            {m.kind === "bank" && (
              <div className="w-64 shrink-0 flex flex-col gap-1.5">
                <input
                  value={m.bankName}
                  onChange={(e) => {
                    setBankDetails(m.key, { bankName: e.target.value });
                    setSaved(false);
                  }}
                  placeholder="Bank name"
                  className="w-full border border-[#E4E9EC] rounded-md px-2.5 py-1.5 text-xs"
                />
                <input
                  value={m.accountName}
                  onChange={(e) => {
                    setBankDetails(m.key, { accountName: e.target.value });
                    setSaved(false);
                  }}
                  placeholder="Account name"
                  className="w-full border border-[#E4E9EC] rounded-md px-2.5 py-1.5 text-xs"
                />
                <input
                  value={m.accountNumber}
                  onChange={(e) => {
                    setBankDetails(m.key, { accountNumber: e.target.value });
                    setSaved(false);
                  }}
                  placeholder="Account number"
                  className="w-full border border-[#E4E9EC] rounded-md px-2.5 py-1.5 text-xs"
                />
              </div>
            )}
          </div>
        ))}
      </Card>

      <button
        onClick={() => setSaved(true)}
        className="max-w-xl w-full bg-primary text-white font-bold text-sm py-3 rounded-lg cursor-pointer"
      >
        Save Changes
      </button>
      {saved && <div className="text-xs text-[#1F7A4D] mt-2.5 text-center">✓ Changes are live on the website</div>}
    </div>
  );
}
