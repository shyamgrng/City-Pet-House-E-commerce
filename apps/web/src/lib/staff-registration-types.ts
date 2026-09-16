export type RegistrationStatus = "Pending" | "Approved" | "Rejected";

export type StaffRegistration = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  nationalId: string;
  degreeCertificate: string;
  nvcCard: string;
  /** Optional -- may be "" if the applicant doesn't have one. */
  drivingLicense: string;
  status: RegistrationStatus;
  submittedAt: number;
};

export function generateStaffId(existing: { staffId: string }[]): string {
  let id: string;
  do {
    id = "ST-" + String(Math.floor(1000 + Math.random() * 9000));
  } while (existing.some((s) => s.staffId === id));
  return id;
}
