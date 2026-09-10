"use client";

import { useRef, useState } from "react";
import EmailInput from "@/components/EmailInput";
import MediaSlot from "@/components/MediaSlot";
import PhoneInput from "@/components/PhoneInput";
import { useAdoption } from "@/context/AdoptionContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAuth } from "@/context/AuthContext";
import { useB2BAuth } from "@/context/B2BAuthContext";
import { useB2BRegistration } from "@/context/B2BRegistrationContext";
import { useCourierAuth } from "@/context/CourierAuthContext";
import { useCourierRegistration } from "@/context/CourierRegistrationContext";
import { useDoctorAuth } from "@/context/DoctorAuthContext";
import { useDoctorRegistration } from "@/context/DoctorRegistrationContext";
import { useOrder } from "@/context/OrderContext";
import { useVet } from "@/context/VetContext";
import type { AdminUser } from "@/lib/admin-user-types";
import type { AdoptionPost } from "@/lib/adoption-types";
import type { B2BAccount } from "@/lib/b2b-auth-types";
import type { B2BRegistration } from "@/lib/b2b-registration-types";
import type { CourierAccount } from "@/lib/courier-auth-types";
import type { CourierRegistration } from "@/lib/courier-registration-types";
import type { DoctorAccount } from "@/lib/doctor-auth-types";
import { generateDoctorId, generateTempPassword, type DoctorRegistration } from "@/lib/doctor-registration-types";
import { isValidEmail } from "@/lib/email-format";
import {
  DOCUMENT_UPLOAD_ACCEPT,
  IMAGE_ACCEPT,
  isAllowedDocumentFile,
  isAllowedImageFile,
  readDocumentFile,
  resizeImageFile,
} from "@/lib/image-upload";
import { notifyEvent } from "@/lib/notify-client";
import type { Order } from "@/lib/order-types";
import { isValidNepalPhone } from "@/lib/phone";
import type { RefundRecord } from "@/lib/refund-types";
import type { Doctor, VetBooking } from "@/lib/vet-types";
import type { Account, Sex } from "@/lib/auth-types";

const subTabs = ["Overview", "Client Account", "Doctor Account", "Courier Account", "B2B Account", "Staff Account"];

type PendingRow = {
  id: string;
  kind: "Doctor" | "Courier" | "B2B";
  title: string;
  subtitle: string;
  contact: string;
  submittedAt: number;
  details: { label: string; value: string }[];
  documents: { label: string; value: string }[];
  onApprove: () => void;
  onReject: () => void;
};

export default function AccountsPage() {
  const [tab, setTab] = useState("Overview");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [approvedCreds, setApprovedCreds] = useState<{ name: string; role: string; loginId: string; password: string } | null>(null);
  const { accounts } = useAuth();
  const { users: adminUsers } = useAdminAuth();
  const { accounts: courierAccounts, addCourier } = useCourierAuth();
  const { accounts: b2bAccounts, addSupplier } = useB2BAuth();
  const { accounts: doctorAccounts, addAccount: addDoctorAccount, saveError: doctorSaveError } = useDoctorAuth();
  const { addDoctor } = useVet();
  const { registrations: doctorRegs, setRegistrationStatus: setDoctorRegStatus, saveError: doctorRegSaveError } = useDoctorRegistration();
  const { registrations: courierRegs, setRegistrationStatus: setCourierRegStatus, saveError: courierRegSaveError } = useCourierRegistration();
  const { registrations: b2bRegs, setRegistrationStatus: setB2bRegStatus, saveError: b2bRegSaveError } = useB2BRegistration();
  const accountCouriers = courierAccounts.map((a) => ({ name: a.companyName, status: "Active" }));
  const accountDoctors = doctorAccounts.map((d) => ({ name: d.name, status: "Active" }));
  const accountB2b = b2bAccounts.map((a) => ({ name: a.companyName, status: "Active" }));

  const approveDoctor = (reg: DoctorRegistration) => {
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
      degreeCertificate: reg.degreeCertificate,
      nvcLicense: reg.nvcLicense,
      nationalId: reg.nationalId,
      cv: reg.cv,
      bankName: reg.bankName,
      bankAccountHolder: reg.accountHolderName,
      bankAccountNumber: reg.accountNumber,
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
      commissionType: "percent",
      commissionValue: 15,
    };
    addDoctor(doctor);
    setDoctorRegStatus(reg.id, "Approved");
    notifyEvent("doctor_registration_approved", reg.email, reg.fullName, { name: reg.fullName, doctorId, password });
    setApprovedCreds({ name: reg.fullName, role: "Doctor", loginId: doctorId, password });
  };

  const approveCourier = (reg: CourierRegistration) => {
    const { courierId, password } = addCourier({
      companyName: reg.companyName,
      email: reg.email,
      phone: reg.phone,
      altPhone: reg.altPhone,
      address: reg.address,
      priceSmall: 0,
      priceMedium: 0,
      priceLarge: 0,
      priceVeryLarge: 0,
      usesDistancePricing: false,
      ratePerKg: 0,
      ratePerKm: 0,
      defaultFlatPrice: 0,
      isActive: courierAccounts.length === 0,
    });
    setCourierRegStatus(reg.id, "Approved");
    notifyEvent("partner_registration_approved", reg.email, reg.contactPerson || reg.companyName, {
      name: reg.contactPerson || reg.companyName,
      role: "Courier",
      loginId: courierId,
      password,
    });
    setApprovedCreds({ name: reg.contactPerson || reg.companyName, role: "Courier", loginId: courierId, password });
  };

  const approveB2B = (reg: B2BRegistration) => {
    const { b2bId, password } = addSupplier({
      companyName: reg.companyName,
      contactPerson: reg.contactPerson,
      email: reg.email,
      phone: reg.phone,
      altPhone: reg.altPhone,
      address: reg.address,
    });
    setB2bRegStatus(reg.id, "Approved");
    notifyEvent("partner_registration_approved", reg.email, reg.contactPerson || reg.companyName, {
      name: reg.contactPerson || reg.companyName,
      role: "B2B Supplier",
      loginId: b2bId,
      password,
    });
    setApprovedCreds({ name: reg.contactPerson || reg.companyName, role: "B2B Supplier", loginId: b2bId, password });
  };

  const pendingRows: PendingRow[] = [
    ...doctorRegs
      .filter((r) => r.status === "Pending")
      .map((r): PendingRow => ({
        id: r.id,
        kind: "Doctor",
        title: r.fullName,
        subtitle: `${r.qualification} · ${r.nvcNumber}`,
        contact: `${r.email} · ${r.phone}`,
        submittedAt: r.submittedAt,
        details: [
          { label: "Address", value: r.address },
          { label: "Emergency Number", value: r.emergencyNumber },
          { label: "Bank", value: [r.bankName, r.accountHolderName, r.accountNumber].filter(Boolean).join(" · ") },
        ],
        documents: [
          { label: "Profile Photo", value: r.profilePhoto },
          { label: "CV", value: r.cv },
          { label: "Primary Degree Certificate", value: r.degreeCertificate },
          { label: "NVC License", value: r.nvcLicense },
          { label: "National Identity Card", value: r.nationalId },
        ],
        onApprove: () => approveDoctor(r),
        onReject: () => setDoctorRegStatus(r.id, "Rejected"),
      })),
    ...courierRegs
      .filter((r) => r.status === "Pending")
      .map((r): PendingRow => ({
        id: r.id,
        kind: "Courier",
        title: r.companyName,
        subtitle: r.contactPerson,
        contact: `${r.email} · ${r.phone}`,
        submittedAt: r.submittedAt,
        details: [
          { label: "Address", value: r.address },
          { label: "Alt Phone", value: r.altPhone },
        ],
        documents: [
          { label: "Business Document", value: r.businessDocument },
          { label: "Owner ID Document", value: r.ownerIdDocument },
        ],
        onApprove: () => approveCourier(r),
        onReject: () => setCourierRegStatus(r.id, "Rejected"),
      })),
    ...b2bRegs
      .filter((r) => r.status === "Pending")
      .map((r): PendingRow => ({
        id: r.id,
        kind: "B2B",
        title: r.companyName,
        subtitle: r.contactPerson,
        contact: `${r.email} · ${r.phone}`,
        submittedAt: r.submittedAt,
        details: [
          { label: "Address", value: r.address },
          { label: "Alt Phone", value: r.altPhone },
        ],
        documents: [
          { label: "Business Document", value: r.businessDocument },
          { label: "Owner ID Document", value: r.ownerIdDocument },
        ],
        onApprove: () => approveB2B(r),
        onReject: () => setB2bRegStatus(r.id, "Rejected"),
      })),
  ].sort((a, b) => a.submittedAt - b.submittedAt);

  const registrationSaveError = doctorRegSaveError || courierRegSaveError || b2bRegSaveError;
  const reviewingRow = reviewingId ? (pendingRows.find((r) => r.id === reviewingId) ?? null) : null;

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
          {pendingRows.length === 0 ? (
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-6 text-center text-xs text-[#8A96A3]">
              No pending registrations
            </div>
          ) : (
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
              {pendingRows.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-[#F0F2F4] last:border-0 text-xs">
                  <div>
                    <div className="font-semibold text-[#1A2027]">
                      {r.title} <span className="text-[10px] font-bold text-[#8A96A3]">· {r.kind}</span>
                    </div>
                    <div className="text-[#8A96A3] mt-0.5">{r.subtitle}</div>
                    <div className="text-[#8A96A3]">{r.contact}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setReviewingId(r.id)}
                      className="px-3 py-1.5 rounded-md text-[11px] font-semibold bg-primary text-white cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "Client Account" && <ClientAccountTab accounts={accounts} />}
      {tab === "Doctor Account" && <DoctorAccountTab doctors={doctorAccounts} />}
      {tab === "Courier Account" && <CourierAccountTab couriers={courierAccounts} />}
      {tab === "B2B Account" && <B2BAccountTab suppliers={b2bAccounts} />}
      {tab === "Staff Account" && <StaffAccountTab users={adminUsers} />}

      {reviewingRow && (
        <PendingRegistrationModal
          row={reviewingRow}
          onClose={() => setReviewingId(null)}
          onApprove={() => {
            reviewingRow.onApprove();
            setReviewingId(null);
          }}
          onReject={() => {
            reviewingRow.onReject();
            setReviewingId(null);
          }}
        />
      )}

      {approvedCreds && (
        <div onClick={() => setApprovedCreds(null)} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[400px]">
            <div className="text-[15px] font-bold text-[#1A2027] mb-1">✓ {approvedCreds.role} approved</div>
            <div className="text-xs text-[#5B6773] mb-4">
              We&apos;ve emailed these sign-in details to {approvedCreds.name}. Email delivery isn&apos;t always guaranteed to arrive — save these now
              in case you need to share them directly.
            </div>
            <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-lg p-3.5 text-xs mb-4">
              <div className="flex justify-between gap-3 mb-1.5">
                <span className="text-[#8A96A3]">Login ID</span>
                <span className="font-bold text-[#1A2027]">{approvedCreds.loginId}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#8A96A3]">Password</span>
                <span className="font-bold text-[#1A2027]">{approvedCreds.password}</span>
              </div>
            </div>
            <button
              onClick={() => setApprovedCreds(null)}
              className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PendingRegistrationModal({
  row,
  onClose,
  onApprove,
  onReject,
}: {
  row: PendingRow;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [rejecting, setRejecting] = useState(false);

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[460px] max-h-[88vh] overflow-auto">
        <div className="flex justify-between items-center mb-1">
          <div className="text-[15px] font-bold text-[#1A2027]">{row.title}</div>
          <div onClick={onClose} className="text-base text-[#8A96A3] cursor-pointer">
            ✕
          </div>
        </div>
        <div className="text-[10px] font-bold text-[#8A96A3] uppercase mb-3.5">{row.kind} Registration</div>

        <div className="text-xs text-[#5B6773] mb-1">{row.subtitle}</div>
        <div className="text-xs text-[#5B6773] mb-3.5">{row.contact}</div>

        <div className="text-[11px] font-bold text-[#8A96A3] uppercase mb-2">Details</div>
        <div className="flex flex-col gap-1.5 text-xs mb-3.5">
          {row.details.map((d) => (
            <div key={d.label} className="flex justify-between gap-3">
              <span className="text-[#8A96A3] shrink-0">{d.label}</span>
              <span className="font-semibold text-[#1A2027] text-right">{d.value || "—"}</span>
            </div>
          ))}
        </div>

        <div className="text-[11px] font-bold text-[#8A96A3] uppercase mb-2">Documents</div>
        <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-[10px] px-3.5 mb-4">
          {row.documents.map((d) => (
            <DocumentPreviewRow key={d.label} label={d.label} value={d.value} />
          ))}
        </div>

        {!rejecting ? (
          <div className="flex gap-2.5">
            <button onClick={onApprove} className="flex-1 bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer">
              Approve
            </button>
            <button
              onClick={() => setRejecting(true)}
              className="px-[18px] py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer border border-[#E4E9EC] text-[#5B6773]"
            >
              Reject
            </button>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <button onClick={onReject} className="flex-1 bg-[#D64545] text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer">
              Confirm Reject
            </button>
            <button
              onClick={() => setRejecting(false)}
              className="px-[18px] py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer bg-[#F0F2F4] text-[#5B6773]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3.5 box-border"
    />
  );
}

function CourierAccountTab({ couriers }: { couriers: CourierAccount[] }) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const visible = couriers.filter(
    (c) => !q || c.companyName.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q) || c.address.toLowerCase().includes(q),
  );

  return (
    <div>
      <SearchBox value={search} onChange={setSearch} placeholder="Search by company, phone, or address..." />
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
        ) : visible.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No couriers match.</div>
        ) : (
          visible.map((c) => (
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
    </div>
  );
}

const ACTIVITY_CATEGORY_COLORS: Record<"Financial" | "Login" | "Client", string> = {
  Client: "#1996C8",
  Financial: "#C9962B",
  Login: "#7A56C8",
};

/** Chronological feed of everything tied to this doctor — consult bookings and outcomes
 * (Client), the doctor's earnings net of platform commission on each completed consult
 * (Financial), and sign-ins/password changes (Login) — built only from timestamps the
 * underlying records actually carry. */
function buildDoctorActivity(
  doctorId: string,
  bookings: VetBooking[],
  doctorRecord: Doctor | undefined,
  securityLog: { text: string; time: number }[] | undefined,
): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  const fmtMoney = (n: number) => "Rs. " + n.toLocaleString("en-IN");
  const commissionType = doctorRecord?.commissionType ?? "percent";
  const commissionValue = doctorRecord?.commissionValue ?? 0;

  for (const b of bookings.filter((b) => b.doctorId === doctorId)) {
    entries.push({
      key: `${b.id}-booked`,
      text: `Consult booked by ${b.ownerName} for ${b.petName} — ${fmtMoney(b.amount)}`,
      time: b.createdAt,
      category: "Client",
    });
    if (b.status === "Payment Rejected") {
      entries.push({
        key: `${b.id}-rejected`,
        text: `Consult ${b.id} payment rejected${b.rejectReason ? ` — ${b.rejectReason}` : ""}`,
        time: b.createdAt,
        category: "Client",
      });
    }
    if (b.completedAt) {
      const commission = commissionType === "percent" ? Math.round((b.amount * commissionValue) / 100) : commissionValue;
      const earning = Math.max(0, b.amount - commission);
      entries.push({
        key: `${b.id}-completed`,
        text: `Completed consult for ${b.petName} (${b.ownerName}) — earned ${fmtMoney(earning)} (${fmtMoney(b.amount)} fee − ${fmtMoney(commission)} commission)`,
        time: b.completedAt,
        category: "Financial",
      });
    }
    if (b.prescription?.sentAt) {
      entries.push({
        key: `${b.id}-prescription`,
        text: `Sent prescription to ${b.ownerName} for ${b.petName}`,
        time: b.prescription.sentAt,
        category: "Client",
      });
    }
  }

  for (const e of securityLog ?? []) {
    entries.push({ key: `sec-${e.time}-${e.text}`, text: e.text, time: e.time, category: "Login" });
  }

  return entries.sort((a, b) => b.time - a.time);
}

const DOCTOR_DOCUMENTS: { field: "cv" | "degreeCertificate" | "nvcLicense" | "nationalId"; label: string }[] = [
  { field: "cv", label: "CV" },
  { field: "degreeCertificate", label: "Primary Degree Certificate" },
  { field: "nvcLicense", label: "NVC License" },
  { field: "nationalId", label: "National Identity Card" },
];

function DocumentPreviewRow({ label, value }: { label: string; value: string }) {
  const isLegacyPlaceholder = value.startsWith("DOC:");
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#F0F2F4] last:border-0 text-xs">
      <div className="flex items-center gap-2.5">
        <span
          className="w-[16px] h-[16px] rounded-[4px] shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: value ? "#1F7A4D" : "#fff", border: `1.5px solid ${value ? "#1F7A4D" : "#C7CDD3"}`, color: "#fff" }}
        >
          {value && "✓"}
        </span>
        <div className="text-[#3A4652]">{label}</div>
      </div>
      {!value ? (
        <span className="text-[11px] text-[#8A96A3]">Not uploaded</span>
      ) : isLegacyPlaceholder ? (
        <span className="text-[11px] text-[#8A96A3]" title="Uploaded before file downloads were supported — ask them to re-upload it.">
          {value.slice(4)} (not downloadable)
        </span>
      ) : (
        <div className="flex items-center gap-3">
          <a href={value} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-primary cursor-pointer">
            Preview
          </a>
          <a href={value} download={label.replace(/\s+/g, "_")} className="text-[11px] font-semibold text-primary cursor-pointer">
            Download
          </a>
        </div>
      )}
    </div>
  );
}

/** Same as DocumentPreviewRow but lets admin upload/replace the file directly — used on the
 * Doctor Account detail page, where admin manages the account rather than just reviewing it. */
function AdminDocumentRow({ label, value, onUpload }: { label: string; value: string; onUpload: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isLegacyPlaceholder = value.startsWith("DOC:");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (isAllowedDocumentFile(file) && !isAllowedImageFile(file)) {
      setBusy(true);
      try {
        onUpload(await readDocumentFile(file));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not process that file — try a different one.");
      } finally {
        setBusy(false);
      }
      return;
    }
    if (!isAllowedImageFile(file)) {
      setError("Please choose a PNG or JPG photo, a PDF, or a Word document.");
      return;
    }
    setBusy(true);
    try {
      onUpload(await resizeImageFile(file, 1000, 1400));
    } catch {
      setError("Could not process that file — try a different one.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-2.5 border-b border-[#F0F2F4] last:border-0 text-xs">
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span
            className="w-[16px] h-[16px] rounded-[4px] shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: value ? "#1F7A4D" : "#fff", border: `1.5px solid ${value ? "#1F7A4D" : "#C7CDD3"}`, color: "#fff" }}
          >
            {value && "✓"}
          </span>
          <div className="text-[#3A4652]">{label}</div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!value ? (
            <span className="text-[11px] text-[#8A96A3]">Not uploaded</span>
          ) : isLegacyPlaceholder ? (
            <span className="text-[11px] text-[#8A96A3]">{value.slice(4)} (not downloadable)</span>
          ) : (
            <>
              <a href={value} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-primary cursor-pointer">
                Preview
              </a>
              <a href={value} download={label.replace(/\s+/g, "_")} className="text-[11px] font-semibold text-primary cursor-pointer">
                Download
              </a>
            </>
          )}
          <input ref={inputRef} type="file" accept={DOCUMENT_UPLOAD_ACCEPT} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="text-[11px] font-semibold text-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
        </div>
      </div>
      {error && <div className="text-[11px] text-[#D64545] mt-1">{error}</div>}
    </div>
  );
}

/** Lets admin replace a doctor's profile photo (or bank QR) directly from the detail page. */
function AdminPhotoUpload({
  value,
  onUpload,
  label = "photo",
  maxWidth = 400,
  maxHeight = 520,
}: {
  value: string;
  onUpload: (dataUrl: string) => void;
  label?: string;
  maxWidth?: number;
  maxHeight?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (!isAllowedImageFile(file)) {
      setError("Please choose an image file.");
      return;
    }
    setBusy(true);
    try {
      onUpload(await resizeImageFile(file, maxWidth, maxHeight));
    } catch {
      setError("Could not process that image — try a different one.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="text-[10px] font-semibold text-primary cursor-pointer disabled:opacity-40"
      >
        {busy ? "Uploading…" : value ? `Replace ${label}` : `Upload ${label}`}
      </button>
      {error && <div className="text-[10px] text-[#D64545] mt-0.5">{error}</div>}
    </div>
  );
}

/** This doctor's booking conversations with clients, newest booking first — read-only, admin never replies from here. */
function buildDoctorChats(doctorId: string, bookings: VetBooking[]): VetBooking[] {
  return bookings.filter((b) => b.doctorId === doctorId && b.chatMessages.length > 0).sort((a, b) => b.createdAt - a.createdAt);
}

function DoctorAccountTab({ doctors }: { doctors: DoctorAccount[] }) {
  const { bookings, doctors: vetDoctors, adminUpdateDoctorProfile } = useVet();
  const { adminUpdateAccount, adminResetPassword, adminSetPassword } = useDoctorAuth();
  const [selected, setSelected] = useState<DoctorAccount | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{
    name: string;
    email: string;
    phone: string;
    emergencyPhone: string;
    address: string;
    qualification: string;
    nvcNumber: string;
  } | null>(null);
  const [resetMsg, setResetMsg] = useState("");
  const [setPwDraft, setSetPwDraft] = useState("");
  const [setPwMsg, setSetPwMsg] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const [editingBank, setEditingBank] = useState(false);
  const [bankDraft, setBankDraft] = useState<{
    bankName: string;
    bankAccountHolder: string;
    bankAccountNumber: string;
    bankBranch: string;
  } | null>(null);
  const [bankMsg, setBankMsg] = useState("");
  const [activityQuery, setActivityQuery] = useState("");
  const [activityFrom, setActivityFrom] = useState("");
  const [activityTo, setActivityTo] = useState("");

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtDateTime = (ts: number) => new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  if (selected) {
    const mine = doctors.find((d) => d.doctorId === selected.doctorId) ?? selected;
    const doctorRecord = vetDoctors.find((d) => d.id === mine.doctorId);
    const activity = buildDoctorActivity(mine.doctorId, bookings, doctorRecord, mine.securityLog);
    const chats = buildDoctorChats(mine.doctorId, bookings);

    const activityQ = activityQuery.trim().toLowerCase();
    const filteredActivity = activity.filter((a) => {
      if (activityQ && !a.text.toLowerCase().includes(activityQ)) return false;
      if (activityFrom && a.time < new Date(activityFrom).setHours(0, 0, 0, 0)) return false;
      if (activityTo && a.time > new Date(activityTo).setHours(23, 59, 59, 999)) return false;
      return true;
    });
    const activityFiltersActive = Boolean(activityQuery || activityFrom || activityTo);
    const clearActivityFilters = () => {
      setActivityQuery("");
      setActivityFrom("");
      setActivityTo("");
    };

    const startEdit = () => {
      setDraft({
        name: mine.name,
        email: mine.email,
        phone: mine.phone,
        emergencyPhone: mine.emergencyPhone,
        address: mine.address,
        qualification: doctorRecord?.qualification ?? "",
        nvcNumber: doctorRecord?.nvcNumber ?? "",
      });
      setEditing(true);
    };
    const save = () => {
      if (!draft) return;
      const { qualification, nvcNumber, ...accountPatch } = draft;
      adminUpdateAccount(mine.doctorId, accountPatch);
      adminUpdateDoctorProfile(mine.doctorId, { qualification, nvcNumber });
      setEditing(false);
    };
    const startEditBank = () => {
      setBankDraft({
        bankName: mine.bankName ?? "",
        bankAccountHolder: mine.bankAccountHolder ?? "",
        bankAccountNumber: mine.bankAccountNumber ?? "",
        bankBranch: mine.bankBranch ?? "",
      });
      setEditingBank(true);
    };
    const saveBank = () => {
      if (!bankDraft) return;
      adminUpdateAccount(mine.doctorId, bankDraft);
      setEditingBank(false);
      setBankMsg("✓ Bank details updated");
      setTimeout(() => setBankMsg(""), 3000);
    };
    const doResetPassword = async () => {
      const res = await adminResetPassword(mine.doctorId);
      setResetMsg(res.ok ? "✓ A temporary password has been emailed to the doctor." : res.error);
      setTimeout(() => setResetMsg(""), 4000);
    };
    const doSetPassword = () => {
      const res = adminSetPassword(mine.doctorId, setPwDraft);
      setSetPwMsg(res.ok ? "✓ Password updated — the doctor will be prompted to change it on next sign-in." : res.error);
      if (res.ok) setSetPwDraft("");
      setTimeout(() => setSetPwMsg(""), 4000);
    };
    const doSendEmail = async () => {
      if (!emailBody.trim()) return;
      setEmailSending(true);
      const res = await notifyEvent("admin_custom_message", mine.email, mine.name, { name: mine.name, subject: emailSubject, message: emailBody });
      setEmailSending(false);
      setEmailMsg(res.ok ? "✓ Email sent." : `Failed to send: ${res.error}`);
      if (res.ok) {
        setEmailSubject("");
        setEmailBody("");
      }
      setTimeout(() => setEmailMsg(""), 4000);
    };

    return (
      <div>
        <div
          onClick={() => {
            setSelected(null);
            setEditing(false);
          }}
          className="text-xs text-primary font-semibold cursor-pointer mb-4"
        >
          ← Back to Doctor Accounts
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
          <div className="min-w-0">
            <div className="border border-[#E4E9EC] rounded-xl p-5 mb-3.5">
              <div className="flex justify-between items-start mb-3.5">
                <div className="flex items-center gap-4">
                  <MediaSlot src={mine.photo} label="profile photo" shape="circle" className="w-[96px] h-[96px] shrink-0" />
                  <div>
                    <div className="text-[15px] font-bold text-[#1A2027]">{mine.name}</div>
                    <div className="text-[11px] text-[#8A96A3] mt-0.5">{mine.doctorId}</div>
                    <AdminPhotoUpload value={mine.photo} onUpload={(photo) => adminUpdateAccount(mine.doctorId, { photo })} />
                  </div>
                </div>
                {!editing && (
                  <button onClick={startEdit} className="text-xs font-semibold text-primary cursor-pointer shrink-0">
                    Edit
                  </button>
                )}
              </div>
              {!editing ? (
                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  <Field label="Email" value={mine.email} />
                  <Field label="Phone" value={mine.phone} />
                  <Field label="Emergency Number" value={mine.emergencyPhone} />
                  <Field label="Address" value={mine.address} />
                  <Field label="Qualification" value={doctorRecord?.qualification || "—"} />
                  <Field label="NVC Number" value={doctorRecord?.nvcNumber || "—"} />
                </div>
              ) : (
                draft && (
                  <div className="text-xs">
                    <EditField label="Full Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Email</div>
                      <EmailInput value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
                    </div>
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Phone</div>
                      <PhoneInput value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
                    </div>
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Emergency Number</div>
                      <PhoneInput value={draft.emergencyPhone} onChange={(v) => setDraft({ ...draft, emergencyPhone: v })} />
                    </div>
                    <EditField label="Address" value={draft.address} onChange={(v) => setDraft({ ...draft, address: v })} />
                    <EditField label="Qualification" value={draft.qualification} onChange={(v) => setDraft({ ...draft, qualification: v })} />
                    <EditField label="NVC Number" value={draft.nvcNumber} onChange={(v) => setDraft({ ...draft, nvcNumber: v })} />
                    <div className="flex gap-2.5 mt-1">
                      <button
                        onClick={save}
                        disabled={!isValidNepalPhone(draft.phone) || !isValidEmail(draft.email) || !draft.name.trim()}
                        className="flex-1 bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="px-[18px] py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer bg-[#F0F2F4] text-[#5B6773]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="border border-[#E4E9EC] rounded-xl p-4 mb-3.5">
              <div className="text-[13px] font-bold text-[#1A2027] mb-3">Password</div>
              <div className="flex items-center justify-between gap-3 mb-3.5 pb-3.5 border-b border-[#F0F2F4]">
                <div className="text-[11px] text-[#8A96A3]">Email the doctor a random temporary password.</div>
                <button
                  onClick={doResetPassword}
                  className="shrink-0 px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E4E9EC] text-[#3A4652] cursor-pointer"
                >
                  Reset Password
                </button>
              </div>
              {resetMsg && <div className="text-[11px] text-[#1F7A4D] mb-3.5">{resetMsg}</div>}

              <div className="text-[11px] text-[#8A96A3] mb-2">Or set a specific password directly (e.g. to tell the doctor yourself).</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={setPwDraft}
                  onChange={(e) => setSetPwDraft(e.target.value)}
                  placeholder="New password"
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
                />
                <button
                  onClick={doSetPassword}
                  disabled={!setPwDraft.trim()}
                  className="shrink-0 bg-primary text-white px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Set Password
                </button>
              </div>
              {setPwMsg && <div className="text-[11px] text-[#1F7A4D] mt-2">{setPwMsg}</div>}
            </div>

            <div className="border border-[#E4E9EC] rounded-xl p-4 mb-3.5">
              <div className="text-[13px] font-bold text-[#1A2027] mb-1">Send Email</div>
              <div className="text-[11px] text-[#8A96A3] mb-3">Send a one-off message to this doctor&apos;s inbox.</div>
              <input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Subject"
                className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-2.5 box-border"
              />
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Message"
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-2.5 box-border resize-none"
              />
              <button
                onClick={doSendEmail}
                disabled={!emailBody.trim() || emailSending}
                className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {emailSending ? "Sending…" : "Send Email"}
              </button>
              {emailMsg && <div className="text-[11px] text-[#1F7A4D] mt-2">{emailMsg}</div>}
            </div>

            <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Documents</div>
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] px-4 mb-5">
              {DOCTOR_DOCUMENTS.map((d) => (
                <AdminDocumentRow
                  key={d.field}
                  label={d.label}
                  value={mine[d.field]}
                  onUpload={(v) => adminUpdateAccount(mine.doctorId, { [d.field]: v })}
                />
              ))}
            </div>

            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[13px] font-bold text-[#1A2027]">Bank Details</div>
              {!editingBank && (
                <button onClick={startEditBank} className="text-xs font-semibold text-primary cursor-pointer">
                  Edit
                </button>
              )}
            </div>
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 mb-5">
              {!editingBank ? (
                <div className="grid grid-cols-2 gap-3.5 text-xs mb-3.5">
                  <Field label="Bank Name" value={mine.bankName || "—"} />
                  <Field label="Account Holder" value={mine.bankAccountHolder || "—"} />
                  <Field label="Account Number" value={mine.bankAccountNumber || "—"} />
                  <Field label="Branch" value={mine.bankBranch || "—"} />
                </div>
              ) : (
                bankDraft && (
                  <>
                    <div className="grid grid-cols-2 gap-3.5 mb-1">
                      <EditField label="Bank Name" value={bankDraft.bankName} onChange={(v) => setBankDraft({ ...bankDraft, bankName: v })} />
                      <EditField
                        label="Account Holder"
                        value={bankDraft.bankAccountHolder}
                        onChange={(v) => setBankDraft({ ...bankDraft, bankAccountHolder: v })}
                      />
                      <EditField
                        label="Account Number"
                        value={bankDraft.bankAccountNumber}
                        onChange={(v) => setBankDraft({ ...bankDraft, bankAccountNumber: v })}
                      />
                      <EditField label="Branch" value={bankDraft.bankBranch} onChange={(v) => setBankDraft({ ...bankDraft, bankBranch: v })} />
                    </div>
                    <div className="flex gap-2.5 mb-3.5">
                      <button
                        onClick={saveBank}
                        className="flex-1 bg-primary text-white text-center py-2 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingBank(false)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer bg-[#F0F2F4] text-[#5B6773]"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )
              )}
              {bankMsg && <div className="text-[11px] text-[#1F7A4D] mb-3.5">{bankMsg}</div>}
              <div className="text-[#8A96A3] text-xs mb-1.5">Bank QR</div>
              {mine.bankQr ? (
                <a href={mine.bankQr} target="_blank" rel="noreferrer" className="block w-fit mb-2">
                  <MediaSlot src={mine.bankQr} label="bank QR" className="w-[140px] h-[140px] rounded-lg border border-[#E4E9EC]" />
                </a>
              ) : (
                <div className="text-xs text-[#8A96A3] mb-2">Not uploaded</div>
              )}
              <AdminPhotoUpload
                value={mine.bankQr ?? ""}
                onUpload={(bankQr) => adminUpdateAccount(mine.doctorId, { bankQr })}
                label="QR"
                maxWidth={600}
                maxHeight={600}
              />
            </div>

            <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Activity ({filteredActivity.length})</div>
            <div className="flex flex-col sm:flex-row gap-2 mb-2.5">
              <input
                value={activityQuery}
                onChange={(e) => setActivityQuery(e.target.value)}
                placeholder="Search activity..."
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[#E4E9EC] text-xs box-border"
              />
              <input
                type="date"
                value={activityFrom}
                onChange={(e) => setActivityFrom(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#E4E9EC] text-xs box-border"
              />
              <input
                type="date"
                value={activityTo}
                onChange={(e) => setActivityTo(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#E4E9EC] text-xs box-border"
              />
              {activityFiltersActive && (
                <button onClick={clearActivityFilters} className="text-xs font-semibold text-primary cursor-pointer shrink-0 px-1">
                  Clear
                </button>
              )}
            </div>
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
              {filteredActivity.length === 0 ? (
                <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">
                  {activity.length === 0 ? "No activity yet" : "No activity matches your filters."}
                </div>
              ) : (
                filteredActivity.map((a) => (
                  <div key={a.key} className="px-4 py-3 border-b border-[#F0F2F4] last:border-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      {a.category && (
                        <span
                          className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                          style={{ background: `${ACTIVITY_CATEGORY_COLORS[a.category]}1A`, color: ACTIVITY_CATEGORY_COLORS[a.category] }}
                        >
                          {a.category}
                        </span>
                      )}
                      <div className="text-xs font-semibold text-[#3A4652]">{a.text}</div>
                    </div>
                    <div className="text-[10px] text-[#8A96A3] mt-0.5">{fmtDateTime(a.time)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-4">
            <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Chat History (read-only)</div>
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden max-h-[80vh] overflow-y-auto">
              {chats.length === 0 ? (
                <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No chat messages yet</div>
              ) : (
                chats.map((b) => (
                  <div key={b.id} className="border-b border-[#F0F2F4] last:border-0 p-3.5">
                    <div className="text-xs font-semibold text-[#1A2027] mb-0.5">
                      {b.ownerName} · {b.petName}
                    </div>
                    <div className="text-[10px] text-[#8A96A3] mb-2">{fmtDate(b.createdAt)}</div>
                    <div className="flex flex-col gap-1.5">
                      {b.chatMessages.map((msg, i) => {
                        const fromDoctor = msg.from === "doctor";
                        return (
                          <div
                            key={i}
                            className="max-w-[85%] px-2.5 py-1.5 text-[11px] leading-relaxed rounded-lg"
                            style={{ alignSelf: fromDoctor ? "flex-end" : "flex-start", background: fromDoctor ? "#1996C8" : "#F0F2F4", color: fromDoctor ? "#fff" : "#1A2027" }}
                          >
                            {msg.text}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const visible = doctors.filter(
    (d) =>
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.doctorId.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      d.phone.toLowerCase().includes(q),
  );

  return (
    <div>
      <SearchBox value={search} onChange={setSearch} placeholder="Search by name, doctor ID, email, or phone..." />
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-x-auto">
        <div className="grid grid-cols-[1.4fr_1.2fr_1fr_0.6fr] gap-2 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC] min-w-[600px]">
          <div>Name</div>
          <div>Contact</div>
          <div>Address</div>
          <div>Actions</div>
        </div>
        {doctors.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No doctor accounts yet</div>
        ) : visible.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No doctors match.</div>
        ) : (
          visible.map((d) => (
            <div
              key={d.doctorId}
              className="grid grid-cols-[1.4fr_1.2fr_1fr_0.6fr] gap-2 px-4 py-3.5 text-xs items-center border-b border-[#F0F2F4] last:border-0 min-w-[600px]"
            >
              <div>
                <div className="font-semibold text-[#1A2027]">{d.name}</div>
                <div className="text-[10px] text-[#8A96A3] mt-0.5">{d.doctorId}</div>
              </div>
              <div className="text-[#5B6773]">
                {d.email}
                <br />
                {d.phone}
              </div>
              <div className="text-[#5B6773]">{d.address || "—"}</div>
              <div onClick={() => setSelected(d)} className="text-primary font-semibold cursor-pointer">
                View
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function B2BAccountTab({ suppliers }: { suppliers: B2BAccount[] }) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const visible = suppliers.filter(
    (s) =>
      !q ||
      s.companyName.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      s.b2bId.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q),
  );

  return (
    <div>
      <SearchBox value={search} onChange={setSearch} placeholder="Search by company, contact person, ID, email, or phone..." />
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-x-auto">
        <div className="grid grid-cols-[1.4fr_1fr_1.2fr_1fr] gap-2 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC] min-w-[600px]">
          <div>Company</div>
          <div>Contact Person</div>
          <div>Contact</div>
          <div>Address</div>
        </div>
        {suppliers.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No B2B accounts yet</div>
        ) : visible.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No B2B accounts match.</div>
        ) : (
          visible.map((s) => (
            <div
              key={s.b2bId}
              className="grid grid-cols-[1.4fr_1fr_1.2fr_1fr] gap-2 px-4 py-3.5 text-xs items-center border-b border-[#F0F2F4] last:border-0 min-w-[600px]"
            >
              <div>
                <div className="font-semibold text-[#1A2027]">{s.companyName}</div>
                <div className="text-[10px] text-[#8A96A3] mt-0.5">{s.b2bId}</div>
              </div>
              <div className="text-[#5B6773]">{s.contactPerson}</div>
              <div className="text-[#5B6773]">
                {s.email}
                <br />
                {s.phone}
              </div>
              <div className="text-[#5B6773]">{s.address || "—"}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StaffAccountTab({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const visible = users.filter(
    (u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q),
  );

  return (
    <div>
      <SearchBox value={search} onChange={setSearch} placeholder="Search by name, email, or role..." />
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-x-auto">
        <div className="grid grid-cols-[1.2fr_1.4fr_0.8fr_0.7fr] gap-2 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC] min-w-[500px]">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
        </div>
        {users.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No staff accounts yet</div>
        ) : visible.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No staff match.</div>
        ) : (
          visible.map((u) => (
            <div
              key={u.email}
              className="grid grid-cols-[1.2fr_1.4fr_0.8fr_0.7fr] gap-2 px-4 py-3.5 text-xs items-center border-b border-[#F0F2F4] last:border-0 min-w-[500px]"
            >
              <div className="font-semibold text-[#1A2027]">{u.name}</div>
              <div className="text-[#5B6773]">{u.email}</div>
              <div className="text-[#5B6773]">{u.role}</div>
              <div className="font-semibold" style={{ color: u.active ? "#1F7A4D" : "#8A96A3" }}>
                {u.active ? "Active" : "Inactive"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

type ActivityEntry = { key: string; text: string; time: number; category?: "Financial" | "Login" | "Client" };

/** A single chronological feed of everything this client has done — order lifecycle, vet
 * consults, adoption posts, and refunds — instead of separate lists per feature area. Only
 * emits events for timestamps the underlying records actually carry (no fabricated dates for
 * status transitions this app doesn't separately timestamp, like a booking being confirmed). */
function buildClientActivity(ownerId: string, orders: Order[], refunds: RefundRecord[], bookings: VetBooking[], posts: AdoptionPost[]): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN");

  const myOrders = orders.filter((o) => o.ownerId === ownerId);
  for (const o of myOrders) {
    entries.push({ key: `${o.id}-placed`, text: `Placed order ${o.id} — ${fmt(o.total)}`, time: o.createdAt });
    if (o.status === "Payment Rejected") {
      entries.push({ key: `${o.id}-rejected`, text: `Order ${o.id} payment rejected${o.rejectReason ? ` — ${o.rejectReason}` : ""}`, time: o.createdAt });
    } else if (o.approvedAt) {
      entries.push({ key: `${o.id}-approved`, text: `Order ${o.id} payment approved`, time: o.approvedAt });
    }
    if (o.deliveredAt) {
      entries.push({ key: `${o.id}-delivered`, text: `Order ${o.id} delivered`, time: o.deliveredAt });
    }
  }

  const myOrderIds = new Set(myOrders.map((o) => o.id));
  for (const r of refunds.filter((r) => myOrderIds.has(r.orderId))) {
    entries.push({ key: `refund-${r.id}`, text: `Refund issued for order ${r.orderId} — ${r.type} — ${fmt(r.amount)}`, time: r.createdAt });
  }

  const myBookings = bookings.filter((b) => b.ownerId === ownerId);
  for (const b of myBookings) {
    entries.push({ key: `${b.id}-booked`, text: `Booked vet consult with ${b.doctorName} for ${b.petName}`, time: b.createdAt });
    if (b.status === "Payment Rejected") {
      entries.push({ key: `${b.id}-rejected`, text: `Vet consult ${b.id} payment rejected${b.rejectReason ? ` — ${b.rejectReason}` : ""}`, time: b.createdAt });
    }
    if (b.completedAt) {
      entries.push({ key: `${b.id}-completed`, text: `Vet consult with ${b.doctorName} completed`, time: b.completedAt });
    }
  }

  const myPosts = posts.filter((p) => p.ownerId === ownerId);
  for (const p of myPosts) {
    entries.push({ key: `${p.id}-posted`, text: `Posted ${p.name} (${p.breed}) for adoption${p.adopted ? " — now adopted" : ""}`, time: p.postedAt });
  }

  return entries.sort((a, b) => b.time - a.time);
}

function ClientAccountTab({ accounts }: { accounts: Account[] }) {
  const { bookings } = useVet();
  const { posts } = useAdoption();
  const { orders, refunds } = useOrder();
  const { adminUpdateAccount, adminResetPassword } = useAuth();
  const [selected, setSelected] = useState<Account | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{ name: string; email: string; phone: string; sex: Sex; dob: string; address: string } | null>(null);
  const [resetMsg, setResetMsg] = useState("");

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtDateTime = (ts: number) => new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  if (selected) {
    const mine = accounts.find((a) => a.id === selected.id) ?? selected;
    const activity = buildClientActivity(mine.id, orders, refunds, bookings, posts);

    const startEdit = () => {
      setDraft({ name: mine.name, email: mine.email, phone: mine.phone, sex: mine.sex, dob: mine.dob, address: mine.address });
      setEditing(true);
    };
    const save = () => {
      if (!draft) return;
      adminUpdateAccount(mine.id, draft);
      setEditing(false);
    };
    const doResetPassword = async () => {
      const res = await adminResetPassword(mine.id);
      setResetMsg(res.ok ? "✓ A temporary password has been emailed to the client." : res.error);
      setTimeout(() => setResetMsg(""), 4000);
    };

    return (
      <div>
        <div
          onClick={() => {
            setSelected(null);
            setEditing(false);
          }}
          className="text-xs text-primary font-semibold cursor-pointer mb-4"
        >
          ← Back to Client Accounts
        </div>

        <div className="border border-[#E4E9EC] rounded-xl p-5 max-w-[560px] mb-3.5">
          <div className="flex justify-between items-center mb-3.5">
            <div className="text-[15px] font-bold text-[#1A2027]">{mine.name}</div>
            {!editing && (
              <button onClick={startEdit} className="text-xs font-semibold text-primary cursor-pointer">
                Edit
              </button>
            )}
          </div>
          {!editing ? (
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <Field label="Email" value={mine.email} />
              <Field label="Phone" value={mine.phone} />
              <Field label="Sex" value={mine.sex} />
              <Field label="Date of Birth" value={mine.dob} />
              <Field label="Address" value={mine.address} />
              <Field label="Joined" value={fmtDate(mine.createdAt)} />
            </div>
          ) : (
            draft && (
              <div className="text-xs">
                <EditField label="Full Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
                <div className="mb-3">
                  <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Email</div>
                  <EmailInput value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
                </div>
                <div className="mb-3">
                  <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Phone</div>
                  <PhoneInput value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
                </div>
                <div className="mb-3">
                  <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Sex</div>
                  <div className="flex gap-2">
                    {(["Male", "Female", "Other"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setDraft({ ...draft, sex: s })}
                        className="flex-1 py-2 px-3 rounded-lg text-xs cursor-pointer"
                        style={{ border: `1px solid ${draft.sex === s ? "#1996C8" : "#E4E9EC"}`, color: "#3A4652" }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <EditField label="Date of Birth" value={draft.dob} onChange={(v) => setDraft({ ...draft, dob: v })} />
                <EditField label="Address" value={draft.address} onChange={(v) => setDraft({ ...draft, address: v })} />
                <div className="flex gap-2.5 mt-1">
                  <button
                    onClick={save}
                    disabled={!isValidNepalPhone(draft.phone) || !isValidEmail(draft.email) || !draft.name.trim()}
                    className="flex-1 bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-[18px] py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer bg-[#F0F2F4] text-[#5B6773]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        <div className="border border-[#E4E9EC] rounded-xl p-4 max-w-[560px] mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-[13px] font-bold text-[#1A2027]">Password</div>
            <div className="text-[11px] text-[#8A96A3] mt-0.5">
              Send the client a temporary password by email — they&apos;ll be prompted to set their own on next sign-in.
            </div>
          </div>
          <button
            onClick={doResetPassword}
            className="shrink-0 px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E4E9EC] text-[#3A4652] cursor-pointer"
          >
            Reset Password
          </button>
        </div>
        {resetMsg && <div className="text-[11px] text-[#1F7A4D] mb-4 -mt-3 max-w-[560px]">{resetMsg}</div>}

        <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Activity ({activity.length})</div>
        <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
          {activity.length === 0 ? (
            <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No activity yet</div>
          ) : (
            activity.map((a) => (
              <div key={a.key} className="px-4 py-3 border-b border-[#F0F2F4] last:border-0">
                <div className="text-xs font-semibold text-[#3A4652]">{a.text}</div>
                <div className="text-[10px] text-[#8A96A3] mt-0.5">{fmtDateTime(a.time)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const visible = accounts.filter(
    (a) => !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.phone.toLowerCase().includes(q),
  );

  return (
    <div>
      <SearchBox value={search} onChange={setSearch} placeholder="Search by name, email, or phone..." />
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Name</div>
          <div>Contact</div>
          <div>Joined</div>
          <div>Actions</div>
        </div>
        {accounts.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No client accounts registered yet</div>
        ) : visible.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No clients match.</div>
        ) : (
          visible.map((a) => (
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

function EditField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3">
      <div className="text-xs font-semibold text-[#3A4652] mb-1.5">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
      />
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
