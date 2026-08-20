export type DoctorAccount = {
  doctorId: string;
  name: string;
  password: string;
};

export const doctorAccountSeed: DoctorAccount[] = [
  { doctorId: "DR-1042", name: "Dr. Sujata Rai, BVSc & AH", password: "doctor123" },
  { doctorId: "DR-0876", name: "Dr. Bikash Shrestha, DVM", password: "doctor123" },
  { doctorId: "DR-1213", name: "Dr. Anjali Gurung, BVSc & AH", password: "doctor123" },
];
