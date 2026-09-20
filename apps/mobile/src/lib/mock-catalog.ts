export type MockProduct = {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  hotSale?: boolean;
};

export type MockPuppy = {
  id: string;
  breed: string;
  price: string;
  status: string;
};

export type MockService = { id: string; name: string };
export type MockBrand = { id: string; name: string };

export const PUPPIES: MockPuppy[] = [
  { id: "pup-1", breed: "Labrador Retriever", price: "Rs. 25,000", status: "Available" },
  { id: "pup-2", breed: "German Shepherd", price: "Rs. 30,000", status: "Available" },
  { id: "pup-3", breed: "Golden Retriever", price: "Rs. 28,000", status: "Available" },
  { id: "pup-4", breed: "Shih Tzu", price: "Rs. 20,000", status: "Available" },
];

export const SERVICES: MockService[] = [
  { id: "svc-vacc", name: "Vaccinations" },
  { id: "svc-groom", name: "Grooming" },
  { id: "svc-desex", name: "Desexing" },
  { id: "svc-surgery", name: "Surgery" },
];

export const TODAYS_DEALS: MockProduct[] = [];

export const PET_FOOD: MockProduct[] = [
  { id: "food-1", name: "Royal Canin Adult Dog Food 3kg", price: "Rs. 2,400" },
  { id: "food-2", name: "Whiskas Cat Food 1.2kg", price: "Rs. 950" },
  { id: "food-3", name: "Pedigree Puppy Food 3kg", price: "Rs. 1,800" },
  { id: "food-4", name: "Purina Kitten Food 1kg", price: "Rs. 1,100" },
];

export const PET_ACCESSORIES: MockProduct[] = [
  { id: "acc-1", name: "Adjustable Nylon Collar", price: "Rs. 450" },
  { id: "acc-2", name: "Retractable Leash 5m", price: "Rs. 850" },
  { id: "acc-3", name: "Stainless Steel Food Bowl", price: "Rs. 350" },
  { id: "acc-4", name: "Pet Carrier Bag", price: "Rs. 2,200" },
];

export const FASHION_WEAR: MockProduct[] = [
  { id: "wear-1", name: "Winter Sweater for Dogs", price: "Rs. 900" },
  { id: "wear-2", name: "Raincoat with Hood", price: "Rs. 1,200" },
  { id: "wear-3", name: "Bandana Set (3pc)", price: "Rs. 400" },
  { id: "wear-4", name: "Bowtie Collar Attachment", price: "Rs. 300" },
];

export const PET_TOYS: MockProduct[] = [
  { id: "toy-1", name: "Squeaky Chew Toy", price: "Rs. 380" },
  { id: "toy-2", name: "Interactive Puzzle Feeder", price: "Rs. 1,050" },
  { id: "toy-3", name: "Rope Tug Toy", price: "Rs. 320" },
  { id: "toy-4", name: "Feather Wand for Cats", price: "Rs. 280" },
];

export const GROOMING_ACCESSORIES: MockProduct[] = [
  { id: "groom-1", name: "Slicker Brush", price: "Rs. 550" },
  { id: "groom-2", name: "Pet Shampoo 250ml", price: "Rs. 700" },
  { id: "groom-3", name: "Nail Clipper Set", price: "Rs. 480" },
  { id: "groom-4", name: "Deshedding Tool", price: "Rs. 950" },
];

export const BRANDS: MockBrand[] = [
  { id: "brand-1", name: "Royal Canin" },
  { id: "brand-2", name: "Pedigree" },
  { id: "brand-3", name: "Whiskas" },
  { id: "brand-4", name: "Purina" },
  { id: "brand-5", name: "Drools" },
];
