export type RegistrationStatus = "Pending" | "Approved" | "Rejected";

export type B2BRegistration = {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  altPhone: string;
  address: string;
  businessDocument: string;
  ownerIdDocument: string;
  status: RegistrationStatus;
  submittedAt: number;
};
