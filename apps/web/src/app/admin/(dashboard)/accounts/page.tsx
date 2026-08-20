"use client";

import { useState } from "react";
import { accountsSummary } from "@/lib/admin-data";
import { b2bAccountSeed } from "@/lib/b2b-auth-types";
import { courierAccountSeed } from "@/lib/courier-auth-types";
import { doctorAccountSeed } from "@/lib/doctor-auth-types";

const subTabs = ["Overview", "Client Account", "Doctor Account", "Courier Account", "B2B Account", "Staff Account"];

const accountDoctors = doctorAccountSeed.map((d) => ({ name: d.name, status: "Active" }));
const accountB2b = b2bAccountSeed.map((a) => ({ name: a.companyName, status: "Active" }));
const accountCouriers = courierAccountSeed.map((a) => ({ name: a.companyName, status: "Active" }));

export default function AccountsPage() {
  const [tab, setTab] = useState("Overview");

  return (
    <div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1">Accounts</div>
      <div className="text-xs text-[#5B6773] mb-4">Every account type across the business — clients, doctors, couriers, and staff.</div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {subTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
            style={{ background: tab === t ? "#1996C8" : "#fff", color: tab === t ? "#fff" : "#3A4652", border: tab === t ? "none" : "1px solid #E4E9EC" }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab !== "Overview" && (
        <div className="bg-white border border-dashed border-[#E4E9EC] rounded-[10px] p-8 text-center text-xs text-[#8A96A3]">
          {tab} — coming soon
        </div>
      )}

      {tab === "Overview" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-4">
            <Stat label="Client Accounts" value={accountsSummary.clients} />
            <Stat label="Doctor Accounts" value={accountsSummary.doctors} />
            <Stat label="Courier Accounts" value={accountsSummary.couriers} />
            <Stat label="Staff Accounts" value={accountsSummary.staff} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
            <Group title="Doctors" rows={accountDoctors} />
            <Group title="B2B Partners" rows={accountB2b} />
            <Group title="Couriers" rows={accountCouriers} />
          </div>

          <div className="text-[13px] font-bold text-[#1A2027] mb-2">Pending Registrations</div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-6 text-center text-xs text-[#8A96A3]">
            No pending registrations
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
      <div className="text-[11px] text-[#8A96A3] font-semibold mb-2">{label}</div>
      <div className="font-heading font-bold text-xl text-[#1A2027]">{value}</div>
    </div>
  );
}

function Group({ title, rows }: { title: string; rows: { name: string; status: string }[] }) {
  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
      <div className="text-[13px] font-bold text-[#1A2027] mb-2">{title}</div>
      {rows.map((r) => (
        <div key={r.name} className="flex justify-between items-center py-1.5 text-xs">
          <span className="font-semibold text-[#1A2027]">{r.name}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E7F3EC] text-[#1F7A4D]">{r.status}</span>
        </div>
      ))}
    </div>
  );
}
