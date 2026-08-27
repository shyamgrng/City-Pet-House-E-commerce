export type RegistrationStatus = "Pending" | "Approved" | "Rejected";

export type DoctorRegistration = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  nvcNumber: string;
  address: string;
  emergencyNumber: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  profilePhoto: string;
  cvFileName: string;
  degreeCertificate: string;
  nvcLicense: string;
  nationalId: string;
  status: RegistrationStatus;
  submittedAt: number;
};

export function generateDoctorId(existing: { doctorId: string }[]): string {
  let id: string;
  do {
    id = "DR-" + String(Math.floor(1000 + Math.random() * 9000));
  } while (existing.some((d) => d.doctorId === id));
  return id;
}

export function generateTempPassword(): string {
  return Math.random().toString(36).slice(2, 10);
}
