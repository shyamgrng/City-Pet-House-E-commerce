import type { Account } from "@/lib/auth-types";

export const accountSeed: Account[] = [
  {
    id: "acc-seed01",
    name: "Aarya Acharya",
    sex: "Female",
    dob: "1996-03-14",
    phone: "+977 9841112233",
    email: "aarya.acharya@example.com",
    address: "Baneshwor, Kathmandu",
    password: "petowner123",
    createdAt: Date.now() - 40 * 24 * 60 * 60 * 1000,
  },
  {
    id: "acc-seed02",
    name: "Nisha Karki",
    sex: "Female",
    dob: "1993-07-22",
    phone: "+977 9812223344",
    email: "nisha.karki@example.com",
    address: "Jawalakhel, Lalitpur",
    password: "petowner123",
    createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
  },
  {
    id: "acc-seed03",
    name: "Bikram Shahi",
    sex: "Male",
    dob: "1990-11-02",
    phone: "+977 9803334455",
    email: "bikram.shahi@example.com",
    address: "Chabahil, Kathmandu",
    password: "petowner123",
    createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
  },
];
