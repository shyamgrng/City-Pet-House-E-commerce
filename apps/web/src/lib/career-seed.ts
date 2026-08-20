import type { CareerApplication, CareerContent } from "@/lib/career-types";

export const careerContentSeed: CareerContent = {
  headline: "Exciting opportunities and a rewarding career.",
  ctaLabel: "CLICK HERE TO EXPRESS YOUR INTEREST",
  jobs: [
    {
      id: "job-clinic",
      title: "Vet Technician (Clinic)",
      tag: "Full-time · Boudha Clinic",
      desc: "Assist our vets with checkups, vaccinations, minor procedures & patient care at our Boudha clinic.",
    },
    {
      id: "job-field",
      title: "Vet Technician (Field)",
      tag: "Full-time · Kathmandu Valley",
      desc: "Travel to home visits across Kathmandu, Lalitpur & Bhaktapur for house-call consults and treatments.",
    },
    {
      id: "job-grooming",
      title: "Dog Grooming (Grooming Ghar)",
      tag: "Full-time · Grooming Ghar",
      desc: "Bathing, styling, nail trims & coat care for dogs of all breeds at our Grooming Ghar studio.",
    },
  ],
};

export const careerApplicationSeed: CareerApplication[] = [
  {
    id: "app-1",
    name: "Sushant Karki",
    phone: "+977 9801234567",
    email: "sushant.karki@gmail.com",
    address: "Chabahil, Kathmandu",
    appliedFor: "Vet Technician (Clinic)",
    cvName: "sushant-karki-cv.pdf",
    coverLetter: "I have 2 years of experience as a vet assistant and am passionate about animal care.",
    status: "New",
    submittedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "app-2",
    name: "Nisha Maharjan",
    phone: "+977 9812345678",
    email: "nisha.mhrj@gmail.com",
    address: "Patan, Lalitpur",
    appliedFor: "Vet Technician (Field)",
    cvName: "nisha-maharjan-cv.pdf",
    coverLetter: "I enjoy fieldwork and have my own scooter, making home visits easy for me.",
    status: "New",
    submittedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: "app-3",
    name: "Roshani Tamang",
    phone: "+977 9841234567",
    email: "roshani.tmg@gmail.com",
    address: "Baneshwor, Kathmandu",
    appliedFor: "Dog Grooming (Grooming Ghar)",
    cvName: "roshani-tamang-cv.pdf",
    coverLetter: "I have completed a professional dog grooming course and love working with dogs.",
    status: "New",
    submittedAt: Date.now() - 5 * 60 * 60 * 1000,
  },
];
