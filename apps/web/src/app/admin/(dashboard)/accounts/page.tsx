"use client";

import { useState } from "react";
import { useAdoption } from "@/context/AdoptionContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAuth } from "@/context/AuthContext";
import { useCourierAuth } from "@/context/CourierAuthContext";
import { useDoctorAuth } from "@/context/DoctorAuthContext";
import { useDoctorRegistration } from "@/context/DoctorRegistrationContext";
import { useVet } from "@/context/VetContext";
import { b2bAccountSeed } from "@/lib/b2b-auth-types";
import type { CourierAccount } from "@/lib/courier-auth-types";
import type { DoctorAccount } from "@/lib/doctor-auth-types";
import { generateDoctorId, generateTempPassword, type DoctorRegistration } from "@/lib/doctor-registration-types";
import { notifyEvent } from "@/lib/notify-client";
import type { Doctor } from "@/lib/vet-types";
import type { Account } from "@/lib/auth-types";

const subTabs = ["Overview", "Client Account", "Doctor Account", "Courier Account", "B2B Account", "Staff Account"];

const accountB2b = b2bAccountSeed.map((a) => ({ name: a.companyName, status: "Active" }));

export default function AccountsPage() {
  const [tab, setTab] = useState("Overview");
  const { accounts } = useAuth();
  const { users: adminUsers } = useAdminAuth();
  const { accounts: courierAccounts } = useCourierAuth();
  const { accounts: doctorAccounts, addAccount: addDoctorAccount, saveError: doctorSaveError } = useDoctorAuth();
  const { addDoctor } = useVet();
  const { registrations, setRegistrationStatus, saveError: registrationSaveError } = useDoctorRegistration();
  const accountCouriers = courierAccounts.map((a) => ({ name: a.companyName, status: "Active" }));
  const accountDoctors = doctorAccounts.map((d) => ({ name: d.name, status: "Active" }));
  const pendingRegistrations = registrations.filter((r) => r.status === "Pending");

  const approveRegistration = (reg: DoctorRegistration) => {
    const doctorId = generateDoctorId(doctorAccounts);
    const password = generateTempPassword();
    const account: DoctorAccount = {
      doctorId,
      name: reg.fullName,
      password,
      email: reg.email,
      phone: reg.phone,
      emergencyPhone: reg.emergencyNumber,
      address: reg.address,
      photo: reg.profilePhoto,
    };
    if (!addDoctorAccount(account)) return;
    const doctor: Doctor = {
      id: doctorId,
      name: reg.fullName,
      qualification: reg.qualification,
      nvcNumber: reg.nvcNumber,
      online: false,
      verified: true,
      consults: 0,
      completed: 0,
      feeRs: 800,
    };
    addDoctor(doctor);
    setRegistrationStatus(reg.id, "Approved");
    notifyEvent("doctor_registration_approved", reg.email, reg.fullName, { name: reg.fullName, doctorId, password });
  };

  const rejectRegistration = (reg: DoctorRegistration) => {
    setRegistrationStatus(reg.id, "Rejected");
  };

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

      {tab === "Overview" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-4">
            <Stat label="Client Accounts" value={accounts.length} />
            <Stat label="Doctor Accounts" value={doctorAccounts.length} />
            <Stat label="Courier Accounts" value={courierAccounts.length} />
            <Stat label="Staff Accounts" value={adminUsers.length} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
            <Group title="Doctors" rows={accountDoctors} />
            <Group title="B2B Partners" rows={accountB2b} />
            <Group title="Couriers" rows={accountCouriers} />
          </div>

          <div className="text-[13px] font-bold text-[#1A2027] mb-2">Pending Registrations</div>
          {(doctorSaveError || registrationSaveError) && (
            <div className="text-xs text-[#D64545] mb-2">{doctorSaveError || registrationSaveError}</div>
          )}
          {pendingRegistrations.length === 0 ? (
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-6 text-center text-xs text-[#8A96A3]">
              No pending registrations
            </div>
          ) : (
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
              {pendingRegistrations.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-[#F0F2F4] last:border-0 text-xs">
                  <div>
                    <div className="font-semibold text-[#1A2027]">
                      {r.fullName} <span className="text-[10px] font-bold text-[#8A96A3]">· Doctor</span>
                    </div>
                    <div className="text-[#8A96A3] mt-0.5">
                      {r.qualification} · {r.nvcNumber}
                    </div>
                    <div className="text-[#8A96A3]">
                      {r.email} · {r.phone}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => rejectRegistration(r)}
                      className="px-3 py-1.5 rounded-md text-[11px] font-semibold border border-[#E4E9EC] text-[#5B6773] cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => approveRegistration(r)}
                      className="px-3 py-1.5 rounded-md text-[11px] font-semibold bg-primary text-white cursor-pointer"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "Client Account" && <ClientAccountTab accounts={accounts} />}
      {tab === "Courier Account" && <CourierAccountTab couriers={courierAccounts} />}

      {(tab === "Doctor Account" || tab === "B2B Account" || tab === "Staff Account") && (
        <div className="bg-white border border-dashed border-[#E4E9EC] rounded-[10px] p-8 text-center text-xs text-[#8A96A3]">
          {tab} — coming soon
        </div>
      )}
    </div>
  );
}

function CourierAccountTab({ couriers }: { couriers: CourierAccount[] }) {
  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-x-auto">
      <div className="grid grid-cols-[1.3fr_1.1fr_1fr_0.6fr_0.6fr_0.6fr_0.6fr] gap-2 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC] min-w-[600px]">
        <div>Company</div>
        <div>Contact</div>
        <div>Address</div>
        <div>Small</div>
        <div>Medium</div>
        <div>Large</div>
        <div>V.Large</div>
      </div>
      {couriers.length === 0 ? (
        <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">
          No courier accounts registered yet — add one in Shop → Delivery Setting.
        </div>
      ) : (
        couriers.map((c) => (
          <div
            key={c.courierId}
            className="grid grid-cols-[1.3fr_1.1fr_1fr_0.6fr_0.6fr_0.6fr_0.6fr] gap-2 px-4 py-3.5 text-xs items-center border-b border-[#F0F2F4] last:border-0 min-w-[600px]"
          >
            <div>
              <div className="font-semibold text-[#1A2027]">{c.companyName}</div>
              <div className="text-[10px] text-[#8A96A3] mt-0.5">{c.courierId}</div>
            </div>
            <div className="text-[#5B6773]">{c.phone}</div>
            <div className="text-[#5B6773]">{c.address || "—"}</div>
            <div>Rs.{c.priceSmall}</div>
            <div>Rs.{c.priceMedium}</div>
            <div>Rs.{c.priceLarge}</div>
            <div>Rs.{c.priceVeryLarge}</div>
          </div>
        ))
      )}
    </div>
  );
}

function ClientAccountTab({ accounts }: { accounts: Account[] }) {
  const { bookings } = useVet();
  const { posts } = useAdoption();
  const [selected, setSelected] = useState<Account | null>(null);

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (selected) {
    const mine = accounts.find((a) => a.id === selected.id) ?? selected;
    const myBookings = bookings.filter((b) => b.ownerId === mine.id);
    const myPosts = posts.filter((p) => p.ownerId === mine.id);

    return (
      <div>
        <div onClick={() => setSelected(null)} className="text-xs text-primary font-semibold cursor-pointer mb-4">
          ← Back to Client Accounts
        </div>
        <div className="border border-[#E4E9EC] rounded-xl p-5 max-w-[560px] mb-5">
          <div className="text-[15px] font-bold text-[#1A2027] mb-3.5">{mine.name}</div>
          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <Field label="Email" value={mine.email} />
            <Field label="Phone" value={mine.phone} />
            <Field label="Sex" value={mine.sex} />
            <Field label="Date of Birth" value={mine.dob} />
            <Field label="Address" value={mine.address} />
            <Field label="Joined" value={fmtDate(mine.createdAt)} />
          </div>
        </div>

        <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Vet Consults ({myBookings.length})</div>
        <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-5">
          {myBookings.length === 0 ? (
            <div className="px-4 py-4 text-xs text-[#8A96A3] text-center">No vet consult bookings</div>
          ) : (
            myBookings.map((b) => (
              <div key={b.id} className="flex justify-between items-center px-4 py-3 border-b border-[#F0F2F4] last:border-0 text-xs">
                <div>
                  <span className="font-semibold text-[#1A2027]">{b.doctorName}</span> · {b.petName}
                </div>
                <div className="text-[#8A96A3]">{b.status}</div>
              </div>
            ))
          )}
        </div>

        <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Adoption Posts ({myPosts.length})</div>
        <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
          {myPosts.length === 0 ? (
            <div className="px-4 py-4 text-xs text-[#8A96A3] text-center">No adoption posts</div>
          ) : (
            myPosts.map((p) => (
              <div key={p.id} className="flex justify-between items-center px-4 py-3 border-b border-[#F0F2F4] last:border-0 text-xs">
                <div>
                  <span className="font-semibold text-[#1A2027]">{p.name}</span> · {p.breed}
                </div>
                <div className="text-[#8A96A3]">{p.adopted ? "Adopted" : "Active"}</div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
      <div className="grid grid-cols-4 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
        <div>Name</div>
        <div>Contact</div>
        <div>Joined</div>
        <div>Actions</div>
      </div>
      {accounts.length === 0 ? (
        <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No client accounts registered yet</div>
      ) : (
        accounts.map((a) => (
          <div key={a.id} className="grid grid-cols-4 px-4 py-3.5 text-xs items-center border-b border-[#F0F2F4] last:border-0">
            <div className="font-semibold text-[#1A2027]">{a.name}</div>
            <div className="text-[#5B6773]">
              {a.email}
              <br />
              {a.phone}
            </div>
            <div className="text-[#5B6773]">{fmtDate(a.createdAt)}</div>
            <div onClick={() => setSelected(a)} className="text-primary font-semibold cursor-pointer">
              View
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[#8A96A3] mb-0.5">{label}</div>
      <div className="font-semibold text-[#1A2027]">{value}</div>
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
