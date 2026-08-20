export type Sex = "Male" | "Female" | "Other";

export type Account = {
  id: string;
  name: string;
  sex: Sex;
  dob: string;
  phone: string;
  email: string;
  address: string;
  password: string;
  createdAt: number;
};

export type RegisterInput = Omit<Account, "id" | "createdAt">;
