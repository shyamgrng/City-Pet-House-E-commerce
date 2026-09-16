/** A letter/form admin sends to the staff member -- appointment letter, job description, VOC
 * letter, or any other form -- the phase 2 counterpart of the documents staff uploads in phase 1. */
export type IssuedDocument = {
  id: string;
  label: string;
  fileUrl: string;
  issuedAt: number;
};

/** Common letters an admin can pick from when sending a document -- a custom label can be typed
 * too, since "or any other forms required" means the list isn't meant to be exhaustive. */
export const ISSUED_DOCUMENT_PRESETS = ["Appointment Letter", "Job Description Letter", "VOC Letter"];

export type StaffAccount = {
  staffId: string;
  name: string;
  password: string;
  email: string;
  phone: string;
  jobTitle: string;
  address: string;
  photo: string;
  /** Uploaded by the staff member from the Staff Portal after their first sign-in. Image/PDF/Word
   * data URL, or "" if not yet provided. */
  nationalId: string;
  degreeCertificate: string;
  nvcCard: string;
  /** Optional -- staff may not have one. */
  drivingLicense: string;
  bankName?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  isActive: boolean;
  /** Set when an admin resets this account's password to a temporary one -- cleared the next time
   * the staff member sets their own password from their profile. */
  mustChangePassword?: boolean;
  createdAt: number;
  /** Append-only log of sign-ins and password changes, shown as "Login" entries in the admin
   * Activity feed. Capped to the most recent entries. */
  securityLog?: { text: string; time: number }[];
  /** Letters/forms admin has sent this staff member -- phase 2, after their documents are on file. */
  issuedDocuments: IssuedDocument[];
};

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
    nationalId: "",
    degreeCertificate: "",
    nvcCard: "",
    drivingLicense: "",
    isActive: true,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    issuedDocuments: [],
  },
];
