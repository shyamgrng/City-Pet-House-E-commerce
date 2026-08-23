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
