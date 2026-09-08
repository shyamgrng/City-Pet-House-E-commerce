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
  degreeCertificate: string;
  nvcLicense: string;
  nationalId: string;
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
    degreeCertificate: "",
    nvcLicense: "",
    nationalId: "",
  },
];
