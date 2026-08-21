"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import EmailInput from "@/components/EmailInput";
import { useContactPage } from "@/context/ContactContext";
import { isValidEmail } from "@/lib/email-format";
import { siteSettings } from "@/lib/site-settings";

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactContent />
    </Suspense>
  );
}

function ContactContent() {
  const { content, ready } = useContactPage();
  const searchParams = useSearchParams();
  const prefillService = searchParams.get("service");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(prefillService ? "Grooming / Services" : "");
  const [message, setMessage] = useState(prefillService ? `I'd like to book: ${prefillService}.` : "");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!ready) return null;

  const submit = () => {
    setError("");
    if (!name.trim() || !email.trim()) return;
    if (!isValidEmail(email)) {
      setError("Enter a valid email like abc@abc.com.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div>
      <div className="px-8 py-10 flex gap-12 flex-wrap max-w-[1300px] mx-auto">
        <div className="flex-1 min-w-[340px]">
          <div className="font-heading font-extrabold text-[34px] text-[#1A2027] mb-4">Contact Information</div>
          <div className="text-sm text-[#5B6773] leading-[1.8] mb-7">{content.intro}</div>
          <div className="grid grid-cols-2 gap-4">
            <InfoCard icon="📍" title="Our Address">
              {siteSettings.address}
            </InfoCard>
            <InfoCard icon="📞" title="Phone Number">
              {siteSettings.phone}
            </InfoCard>
            <InfoCard icon="✉️" title="Email Address">
              {siteSettings.email}
            </InfoCard>
            <InfoCard icon="🕒" title="Working Time">
              {siteSettings.hours}
            </InfoCard>
          </div>
        </div>

        <div className="flex-1 min-w-[320px] max-w-[460px]">
          <div className="font-heading font-extrabold text-2xl text-[#1A2027] mb-5">Send Us a Message</div>
          {submitted ? (
            <div className="bg-white border border-[#E4E9EC] rounded-2xl p-7 text-center">
              <div className="text-4xl mb-2.5">✅</div>
              <div className="font-heading font-bold text-base text-[#1A2027] mb-1.5">Message Sent</div>
              <div className="text-[13px] text-[#5B6773]">Thanks {name} — we&apos;ll get back to you shortly.</div>
            </div>
          ) : (
            <div className="bg-white border border-[#E4E9EC] rounded-2xl p-[22px] flex flex-col gap-3.5">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name*"
                className="w-full box-border h-[46px] rounded-[9px] border border-[#E4E9EC] px-3.5 text-[13px]"
              />
              <EmailInput value={email} onChange={setEmail} placeholder="Your Email*" className="" />
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full box-border h-[46px] rounded-[9px] border border-[#E4E9EC] px-3.5 text-[13px] bg-white"
              >
                <option value="">Select Subject</option>
                <option value="Shop / Order">Shop / Order</option>
                <option value="Vet Consult">Vet Consult</option>
                <option value="Adoption">Adoption</option>
                <option value="Grooming / Services">Grooming / Services</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write Message"
                className="w-full box-border h-[130px] rounded-[9px] border border-[#E4E9EC] p-3.5 text-[13px] font-sans resize-y"
              />
              {error && <div className="text-xs text-[#D64545]">{error}</div>}
              <button
                onClick={submit}
                className="w-full box-border bg-primary text-white text-center py-3.5 rounded-[9px] text-[13px] font-bold cursor-pointer tracking-[0.5px]"
              >
                SUBMIT
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 max-w-[1300px] mx-auto mt-6 mb-12">
        <div className="rounded-2xl overflow-hidden border border-[#E4E9EC] h-[320px]">
          <iframe src={content.mapLink} className="w-full h-full border-0" loading="lazy" />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E4E9EC] rounded-2xl p-5 flex gap-3.5 items-start">
      <div className="w-11 h-11 rounded-[10px] bg-[#F7F3EC] flex items-center justify-center text-lg shrink-0">{icon}</div>
      <div>
        <div className="font-heading font-bold text-[15px] text-[#1A2027] mb-1.5">{title}</div>
        <div className="text-[13px] text-[#5B6773] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
