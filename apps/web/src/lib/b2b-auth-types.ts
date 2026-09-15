export type B2BAccount = {
  b2bId: string;
  companyName: string;
  contactPerson: string;
  password: string;
  email: string;
  phone: string;
  altPhone: string;
  address: string;
  /** Registration documents, carried over from the B2BRegistration on approval -- image data URL
   * or a real PDF/Word data URL. Empty/unset means the document isn't on file. */
  businessDocument?: string;
  ownerIdDocument?: string;
  /** Set when an admin resets this account's password to a temporary one — cleared the next time
   * the supplier sets their own password from their profile. */
  mustChangePassword?: boolean;
  /** Append-only log of sign-ins and password changes (self-service and admin-initiated), shown
   * as "Login" entries in the admin Activity feed. Capped to the most recent entries. */
  securityLog?: { text: string; time: number }[];
};

export const b2bAccountSeed: B2BAccount[] = [
  {
    b2bId: "B2B-1001",
    companyName: "Himal Pet Supplies Pvt. Ltd.",
    contactPerson: "Rajendra Bajracharya",
    password: "supplier123",
    email: "sales@himalpetsupplies.com.np",
    phone: "+977 9801234501",
    altPhone: "+977 015551234",
    address: "Balaju Industrial Area, Kathmandu",
  },
];
