export type CourierAccount = {
  courierId: string;
  companyName: string;
  password: string;
};

export const courierAccountSeed: CourierAccount[] = [{ courierId: "CR-1001", companyName: "Valley Express Logistics", password: "courier123" }];
