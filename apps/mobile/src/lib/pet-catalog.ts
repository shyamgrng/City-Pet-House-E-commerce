// Matches petSpeciesList / vaccineStages / dewormStages in apps/web/src/lib/pet-types.ts exactly.
export const PET_SPECIES_LIST = ["Dog", "Cat", "Small Pets", "Birds", "Fish"];
export const SPECIES_CHIPS = ["All", ...PET_SPECIES_LIST];

export const VACCINE_STAGES_COUNT = 7;
export const DEWORM_STAGES_COUNT = 4;

export const OTHER_ANIMALS_LABELS: Record<string, string> = {
  Dog: "Other Puppies Available",
  Cat: "Other Kittens Available",
  "Small Pets": "Other Small Pets Available",
  Birds: "Other Birds Available",
  Fish: "Other Fish Available",
};

export function otherAnimalsLabel(species: string): string {
  return OTHER_ANIMALS_LABELS[species] ?? "Other Pets Available";
}

export type PetMock = {
  id: string;
  breed: string;
  species: string;
  sex: string;
  age: string;
  price: number;
  deliveryFee: number;
  tags: string[];
  photoCount: number;
  vaccinationsDone: number;
  dewormingsDone: number;
  hasVideo?: boolean;
};

export const PETS: PetMock[] = [
  { id: "pet-1", breed: "Siberian Husky", species: "Dog", sex: "Male", age: "9 wks", price: 25000, deliveryFee: 1000, tags: ["Playful", "Family-raised"], photoCount: 3, vaccinationsDone: 3, dewormingsDone: 2, hasVideo: true },
  { id: "pet-2", breed: "German Shepherd", species: "Dog", sex: "Male", age: "8 wks", price: 30000, deliveryFee: 1000, tags: ["Guard Breed"], photoCount: 4, vaccinationsDone: 2, dewormingsDone: 2 },
  { id: "pet-3", breed: "Golden Retriever", species: "Dog", sex: "Female", age: "9 wks", price: 28000, deliveryFee: 1000, tags: ["Family-raised"], photoCount: 2, vaccinationsDone: 3, dewormingsDone: 3 },
  { id: "pet-4", breed: "Shih Tzu", species: "Dog", sex: "Male", age: "10 wks", price: 20000, deliveryFee: 1000, tags: ["Low Shedding"], photoCount: 3, vaccinationsDone: 1, dewormingsDone: 1 },
  { id: "pet-5", breed: "Persian Kitten", species: "Cat", sex: "Female", age: "10 wks", price: 18000, deliveryFee: 1000, tags: ["Calm Temperament"], photoCount: 4, vaccinationsDone: 2, dewormingsDone: 2 },
  { id: "pet-6", breed: "Siamese Kitten", species: "Cat", sex: "Male", age: "9 wks", price: 15000, deliveryFee: 1000, tags: ["Vocal", "Affectionate"], photoCount: 3, vaccinationsDone: 1, dewormingsDone: 1 },
  { id: "pet-7", breed: "Holland Lop Rabbit", species: "Small Pets", sex: "Female", age: "3 months", price: 4500, deliveryFee: 500, tags: ["Beginner Friendly"], photoCount: 3, vaccinationsDone: 0, dewormingsDone: 1 },
  { id: "pet-8", breed: "Syrian Hamster", species: "Small Pets", sex: "Male", age: "2 months", price: 1200, deliveryFee: 300, tags: [], photoCount: 2, vaccinationsDone: 0, dewormingsDone: 0 },
  { id: "pet-9", breed: "Sun Conure", species: "Birds", sex: "Male", age: "4 months", price: 12000, deliveryFee: 800, tags: ["Colorful"], photoCount: 4, vaccinationsDone: 0, dewormingsDone: 0, hasVideo: true },
  { id: "pet-10", breed: "Lovebird Pair", species: "Birds", sex: "Pair", age: "6 months", price: 6500, deliveryFee: 600, tags: ["Bonded Pair"], photoCount: 3, vaccinationsDone: 0, dewormingsDone: 0 },
  { id: "pet-11", breed: "Koi Fish (Set of 5)", species: "Fish", sex: "—", age: "6 months", price: 3500, deliveryFee: 400, tags: ["Pond Ready"], photoCount: 2, vaccinationsDone: 0, dewormingsDone: 0 },
  { id: "pet-12", breed: "Betta Fish", species: "Fish", sex: "Male", age: "3 months", price: 600, deliveryFee: 200, tags: [], photoCount: 1, vaccinationsDone: 0, dewormingsDone: 0 },
];
