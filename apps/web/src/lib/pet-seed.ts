import { dewormStages, PET_PHOTO_SLOTS, slugify, vaccineStages, type Pet } from "./pet-types";

type SeedRow = [breed: string, species: string, sex: string, age: string, price: number, deliveryFee: number, tags: string[]];

// Matches the design's petsData array exactly (breed, species, sex, age, price,
// deliveryFee, tags) — all status "Available", no photos/video uploaded yet.
const rows: SeedRow[] = [
  ["Pug", "Dog", "Male", "8 wks", 30000, 1500, ["Vaccinated", "Dewormed"]],
  ["Siberian Husky", "Dog", "Male", "9 wks", 55000, 2000, ["Vaccinated", "Dewormed"]],
  ["Persian Kitten", "Cat", "Female", "10 wks", 18000, 1000, ["Vaccinated", "Dewormed"]],
  ["Siamese Kitten", "Cat", "Male", "9 wks", 15000, 1000, ["Vaccinated"]],
  ["Holland Lop Rabbit", "Small Pets", "Female", "3 months", 4500, 500, ["Dewormed"]],
  ["Syrian Hamster", "Small Pets", "Male", "2 months", 1200, 300, ["Vet Checked"]],
  ["Sun Conure", "Birds", "Male", "4 months", 12000, 800, ["Vet Checked"]],
  ["Lovebird Pair", "Birds", "Pair", "6 months", 6500, 600, ["Vet Checked"]],
  ["Koi Fish (Set of 5)", "Fish", "—", "6 months", 3500, 400, ["Vet Checked"]],
  ["Betta Fish", "Fish", "Male", "3 months", 600, 200, []],
];

export const petSeed: Pet[] = rows.map(([breed, species, sex, age, price, deliveryFee, tags]) => ({
  id: slugify(breed),
  breed,
  species,
  sex,
  age,
  price,
  deliveryFee,
  tags,
  status: "Available",
  photos: Array(PET_PHOTO_SLOTS).fill(""),
  photoAlts: Array(PET_PHOTO_SLOTS).fill(""),
  coverPhotoIndex: 0,
  video: "",
  vaccinations: Array(vaccineStages.length).fill(false),
  dewormings: Array(dewormStages.length).fill(false),
}));
