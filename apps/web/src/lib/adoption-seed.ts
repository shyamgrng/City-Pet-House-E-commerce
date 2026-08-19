import { slugify, type AdoptionPost } from "./adoption-types";

// Matches the design's adoptionPosts seed array exactly.
const rows: Omit<AdoptionPost, "id" | "adopted">[] = [
  {
    name: "Kalu",
    breed: "Mixed Breed (Local)",
    age: "1.5 yrs",
    sex: "Male",
    vaccination: "Rabies, DHPPiL — up to date",
    address: "Boudha, Gokarneshwor-6, Kathmandu",
    desc: "Friendly, house-trained, good with kids. Owner relocating abroad.",
    contact: "+977 9841122334",
    postedDaysAgo: 2,
  },
  {
    name: "Milo",
    breed: "Labrador Mix",
    age: "3 yrs",
    sex: "Male",
    vaccination: "Rabies — up to date, DHPPiL due next month",
    address: "Baneshwor-10, Kathmandu",
    desc: "Calm and loyal, needs a yard to play in. Vaccinated & neutered.",
    contact: "+977 9812233445",
    postedDaysAgo: 6,
  },
  {
    name: "Chandni",
    breed: "Indie",
    age: "8 months",
    sex: "Female",
    vaccination: "First round complete, booster pending",
    address: "Patan, Lalitpur",
    desc: "Energetic pup, great with other dogs. Looking for an active family.",
    contact: "+977 9860011223",
    postedDaysAgo: 11,
  },
];

export const adoptionSeed: AdoptionPost[] = rows.map((r) => ({
  ...r,
  id: slugify(r.name),
  adopted: false,
}));
