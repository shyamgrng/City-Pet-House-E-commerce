export type CourierAccount = {
  courierId: string;
  companyName: string;
  password: string;
  email: string;
  phone: string;
  altPhone: string;
  address: string;
  /** These 4 tier prices plus orderValuePct are the courier's COST to us -- never shown to the
   * customer. What the customer pays is City Pet House's own tiered fee in DeliverySettings. */
  priceSmall: number;
  priceMedium: number;
  priceLarge: number;
  priceVeryLarge: number;
  /** Percentage of the order subtotal the courier adds on top of the tier price (e.g. for COD
   * collection/insurance risk on higher-value parcels). 0 if the courier doesn't charge this. */
  orderValuePct: number;
  usesDistancePricing: boolean;
  ratePerKg: number;
  ratePerKm: number;
  defaultFlatPrice: number;
  /** Whether this is the courier we're currently using -- only one account should be active at a
   * time. Drives our delivery cost tracking only; it no longer affects what customers are charged. */
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
    orderValuePct: 2,
    usesDistancePricing: false,
    ratePerKg: 0,
    ratePerKm: 0,
    defaultFlatPrice: 0,
    isActive: true,
  },
];
