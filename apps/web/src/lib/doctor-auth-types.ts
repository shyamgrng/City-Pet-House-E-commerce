export type DoctorAccount = {
  doctorId: string;
  name: string;
  password: string;
  email: string;
  phone: string;
  emergencyPhone: string;
  address: string;
  photo: string;
  /** Registration documents -- image data URL, or "DOC:<filename>" for a PDF/Word file that was
   * never decoded to an image. Empty string means the document hasn't been provided yet. */
  cv: string;
  degreeCertificate: string;
  nvcLicense: string;
  nationalId: string;
  /** Set when an admin resets this account's password to a temporary one — cleared the next time
   * the doctor sets their own password from their profile. */
  mustChangePassword?: boolean;
};

export const doctorAccountSeed: DoctorAccount[] = [
  {
    doctorId: "DR-1042",
    name: "Dr. Sujata Rai, BVSc & AH",
    password: "doctor123",
    email: "sujata.rai@citypethouse.com",
    phone: "+977 9841001042",
    emergencyPhone: "+977 9841009999",
    address: "Baneshwor, Kathmandu",
    photo: "",
    cv: "",
    degreeCertificate: "",
    nvcLicense: "",
    nationalId: "",
  },
  {
    doctorId: "DR-0876",
    name: "Dr. Bikash Shrestha, DVM",
    password: "doctor123",
    email: "bikash.shrestha@citypethouse.com",
    phone: "+977 9841000876",
    emergencyPhone: "+977 9841008888",
    address: "Patan, Lalitpur",
    photo: "",
    cv: "",
    degreeCertificate: "",
    nvcLicense: "",
    nationalId: "",
  },
  {
    doctorId: "DR-1213",
    name: "Dr. Anjali Gurung, BVSc & AH",
    password: "doctor123",
    email: "anjali.gurung@citypethouse.com",
    phone: "+977 9841001213",
    emergencyPhone: "+977 9841007777",
    address: "Boudha, Kathmandu",
    photo: "",
    cv: "",
    degreeCertificate: "",
    nvcLicense: "",
    nationalId: "",
  },
];
