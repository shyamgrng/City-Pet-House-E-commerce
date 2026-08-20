export type B2BAccount = {
  b2bId: string;
  companyName: string;
  contactPerson: string;
  password: string;
  email: string;
  phone: string;
  altPhone: string;
  address: string;
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
