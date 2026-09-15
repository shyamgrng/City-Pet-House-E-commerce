export type Sex = "Male" | "Female" | "Other";

export type SavedAddress = {
  id: string;
  label: string;
  line: string;
};

export type Account = {
  id: string;
  name: string;
  sex: Sex;
  dob: string;
  phone: string;
  email: string;
  /** The active/primary address — kept in sync with the entry in `addresses` matching `primaryAddressId`, so every existing place that reads a customer's address (cart, orders, admin) automatically reflects whichever saved address is marked primary. */
  address: string;
  addresses: SavedAddress[];
  primaryAddressId: string;
  password: string;
  createdAt: number;
  /** Set when an admin resets this account's password to a temporary one — cleared the next time
   * the client sets their own password from their profile. */
  mustChangePassword?: boolean;
};

export type RegisterInput = Omit<Account, "id" | "createdAt" | "addresses" | "primaryAddressId">;
