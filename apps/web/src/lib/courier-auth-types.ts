export type CourierAccount = {
  courierId: string;
  companyName: string;
  password: string;
  email: string;
  phone: string;
  altPhone: string;
  address: string;
  priceSmall: number;
  priceMedium: number;
  priceLarge: number;
  priceVeryLarge: number;
  usesDistancePricing: boolean;
  ratePerKg: number;
  ratePerKm: number;
  defaultFlatPrice: number;
  /** Whether this courier's rate card drives checkout pricing — only one account should be active at a time. */
  isActive: boolean;
  contactPerson?: string;
  /** Registration documents, carried over from the CourierRegistration on approval -- image data
   * URL or a real PDF/Word data URL. Empty/unset means the document isn't on file. */
  businessDocument?: string;
  ownerIdDocument?: string;
  /** Set when an admin resets this account's password to a temporary one — cleared the next time
   * the courier sets their own password from their profile. */
  mustChangePassword?: boolean;
  /** Append-only log of sign-ins and password changes (self-service and admin-initiated), shown
   * as "Login" entries in the admin Activity feed. Capped to the most recent entries. */
  securityLog?: { text: string; time: number }[];
};

export const courierAccountSeed: CourierAccount[] = [
  {
    courierId: "CR-1001",
    companyName: "Valley Express Logistics",
    password: "courier123",
    email: "dispatch@valleyexpress.com.np",
    phone: "+977 9801122334",
    altPhone: "+977 015545566",
    address: "Kalanki, Kathmandu",
    priceSmall: 100,
    priceMedium: 150,
    priceLarge: 220,
    priceVeryLarge: 300,
    usesDistancePricing: false,
    ratePerKg: 0,
    ratePerKm: 0,
    defaultFlatPrice: 0,
    isActive: true,
  },
];
