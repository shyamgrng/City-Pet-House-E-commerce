import { slugify, type Pet } from "./pet-types";

type SeedRow = [breed: string, species: string, sex: string, age: string, price: number, deliveryFee: number, tags: string[], photos: number, videos: number];

// Matches the design's petsData array exactly (breed, species, sex, age, price,
// deliveryFee, tags, photo/video counts) — all status "Available".
const rows: SeedRow[] = [
  ["Pug", "Dog", "Male", "8 wks", 30000, 1500, ["Vaccinated", "Dewormed"], 5, 1],
  ["Siberian Husky", "Dog", "Male", "9 wks", 55000, 2000, ["Vaccinated", "Dewormed"], 6, 1],
  ["Persian Kitten", "Cat", "Female", "10 wks", 18000, 1000, ["Vaccinated", "Dewormed"], 4, 0],
  ["Siamese Kitten", "Cat", "Male", "9 wks", 15000, 1000, ["Vaccinated"], 3, 1],
  ["Holland Lop Rabbit", "Small Pets", "Female", "3 months", 4500, 500, ["Dewormed"], 3, 0],
  ["Syrian Hamster", "Small Pets", "Male", "2 months", 1200, 300, ["Vet Checked"], 2, 0],
  ["Sun Conure", "Birds", "Male", "4 months", 12000, 800, ["Vet Checked"], 4, 1],
  ["Lovebird Pair", "Birds", "Pair", "6 months", 6500, 600, ["Vet Checked"], 3, 0],
  ["Koi Fish (Set of 5)", "Fish", "—", "6 months", 3500, 400, ["Vet Checked"], 3, 1],
  ["Betta Fish", "Fish", "Male", "3 months", 600, 200, [], 2, 0],
];

export const petSeed: Pet[] = rows.map(([breed, species, sex, age, price, deliveryFee, tags, photos, videos]) => ({
  id: slugify(breed),
  breed,
  species,
  sex,
  age,
  price,
  deliveryFee,
  tags,
  status: "Available",
  photos,
  videos,
}));
