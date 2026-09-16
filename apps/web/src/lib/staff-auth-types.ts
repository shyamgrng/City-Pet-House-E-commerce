/** One document the admin has requested from this staff member -- the checklist is picked per
 * staff member at creation time (from STAFF_DOCUMENT_PRESETS, or a custom label), not a fixed
 * set of fields, since different roles need different paperwork. */
export type StaffDocumentSlot = {
  id: string;
  label: string;
  /** Image/PDF/Word data URL once uploaded, "" until the staff member provides it. */
  fileUrl: string;
  fileName: string;
};

export type StaffAccount = {
  staffId: string;
  name: string;
  password: string;
  email: string;
  phone: string;
  jobTitle: string;
  address: string;
  photo: string;
  documents: StaffDocumentSlot[];
  bankName?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  /** Invited: admin created the account and is waiting on the staff member. Submitted: staff has
   * uploaded every requested document. Approved: admin has reviewed and signed off. */
  status: "Invited" | "Submitted" | "Approved";
  isActive: boolean;
  /** Set when an admin resets this account's password to a temporary one -- cleared the next time
   * the staff member sets their own password from their profile. */
  mustChangePassword?: boolean;
  createdAt: number;
  submittedAt?: number;
  approvedAt?: number;
  /** Append-only log of sign-ins and password changes, shown as "Login" entries in the admin
   * Activity feed. Capped to the most recent entries. */
  securityLog?: { text: string; time: number }[];
};

/** Common documents an admin can pick from when inviting a new staff member -- the checklist is
 * still free-form (a custom label can be added too), this is just a starting point. */
export const STAFF_DOCUMENT_PRESETS = [
  "Citizenship Certificate",
  "Passport-size Photo",
  "CV / Resume",
  "Academic Certificate",
  "Police Clearance Certificate",
  "Bank Details / Cheque Copy",
  "PAN Card",
];

export const staffAccountSeed: StaffAccount[] = [
  {
    staffId: "ST-1001",
    name: "Ramesh Thapa",
    password: "staff123",
    email: "ramesh.thapa@citypethouse.com",
    phone: "+977 9841001001",
    jobTitle: "Store Assistant",
    address: "",
    photo: "",
    documents: [
      { id: "doc-1", label: "Citizenship Certificate", fileUrl: "", fileName: "" },
      { id: "doc-2", label: "CV / Resume", fileUrl: "", fileName: "" },
    ],
    status: "Invited",
    isActive: true,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
];
