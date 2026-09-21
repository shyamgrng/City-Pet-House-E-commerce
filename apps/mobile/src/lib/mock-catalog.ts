export type MockProduct = {
  id: string;
  name: string;
  price: string;
  /** Numeric price, needed for Add to Cart (the string is display-only, Indian-grouped). */
  priceValue: number;
  originalPrice?: string;
  hotSale?: boolean;
  newArrival?: boolean;
  outOfStock?: boolean;
  rating?: number;
};

export type MockPuppy = {
  id: string;
  breed: string;
  sex: string;
  age: string;
  price: string;
};

export type MockService = { id: string; name: string };
export type MockBrand = { id: string; name: string };
export type MockTestimonial = { id: string; quote: string; name: string };
export type MockBlogPost = { id: string; date: string; title: string };

export const PUPPIES: MockPuppy[] = [
  { id: "pup-1", breed: "Siberian Husky", sex: "Male", age: "9 wks", price: "Rs. 25,000" },
  { id: "pup-2", breed: "Persian Kitten", sex: "Female", age: "10 wks", price: "Rs. 18,000" },
  { id: "pup-3", breed: "German Shepherd", sex: "Male", age: "8 wks", price: "Rs. 30,000" },
  { id: "pup-4", breed: "Golden Retriever", sex: "Female", age: "9 wks", price: "Rs. 28,000" },
];

export const SERVICES: MockService[] = [
  { id: "svc-vacc", name: "Vaccinations" },
  { id: "svc-groom", name: "Grooming" },
  { id: "svc-desex", name: "Desexing" },
  { id: "svc-surgery", name: "Surgery" },
];

export const TODAYS_DEALS: MockProduct[] = [];

export const PET_FOOD: MockProduct[] = [
  { id: "food-1", name: "Royal Canin Adult Dog Food 3kg", price: "Rs. 2,400", priceValue: 2400, rating: 4 },
  { id: "food-2", name: "Whiskas Cat Food 1.2kg", price: "Rs. 950", priceValue: 950, rating: 5 },
  { id: "food-3", name: "Pedigree Puppy Food 3kg", price: "Rs. 1,800", priceValue: 1800, newArrival: true },
  { id: "food-4", name: "Purina Kitten Food 1kg", price: "Rs. 1,100", priceValue: 1100 },
];

export const PET_ACCESSORIES: MockProduct[] = [
  { id: "acc-1", name: "Adjustable Nylon Collar", price: "Rs. 450", priceValue: 450 },
  { id: "acc-2", name: "Retractable Leash 5m", price: "Rs. 850", priceValue: 850, rating: 4 },
  { id: "acc-3", name: "Stainless Steel Food Bowl", price: "Rs. 350", priceValue: 350 },
  { id: "acc-4", name: "Pet Carrier Bag", price: "Rs. 2,200", priceValue: 2200, outOfStock: true },
];

export const FASHION_WEAR: MockProduct[] = [
  { id: "wear-1", name: "Winter Sweater for Dogs", price: "Rs. 900", priceValue: 900 },
  { id: "wear-2", name: "Raincoat with Hood", price: "Rs. 1,200", priceValue: 1200 },
  { id: "wear-3", name: "Bandana Set (3pc)", price: "Rs. 400", priceValue: 400 },
  { id: "wear-4", name: "Bowtie Collar Attachment", price: "Rs. 300", priceValue: 300 },
];

export const PET_TOYS: MockProduct[] = [
  { id: "toy-1", name: "Squeaky Chew Toy", price: "Rs. 380", priceValue: 380 },
  { id: "toy-2", name: "Interactive Puzzle Feeder", price: "Rs. 1,050", priceValue: 1050, rating: 5 },
  { id: "toy-3", name: "Rope Tug Toy", price: "Rs. 320", priceValue: 320 },
  { id: "toy-4", name: "Feather Wand for Cats", price: "Rs. 280", priceValue: 280 },
];

export const GROOMING_ACCESSORIES: MockProduct[] = [
  { id: "groom-1", name: "Slicker Brush", price: "Rs. 550", priceValue: 550 },
  { id: "groom-2", name: "Pet Shampoo 250ml", price: "Rs. 700", priceValue: 700 },
  { id: "groom-3", name: "Nail Clipper Set", price: "Rs. 480", priceValue: 480 },
  { id: "groom-4", name: "Deshedding Tool", price: "Rs. 950", priceValue: 950 },
];

export const BRANDS: MockBrand[] = [
  { id: "brand-1", name: "Royal Canin" },
  { id: "brand-2", name: "Pedigree" },
  { id: "brand-3", name: "Whiskas" },
  { id: "brand-4", name: "Purina" },
  { id: "brand-5", name: "Drools" },
];

export const TESTIMONIALS: MockTestimonial[] = [
  { id: "t-1", quote: "Great service and my puppy arrived healthy and happy!", name: "Sujata K." },
  { id: "t-2", quote: "The vet consult was quick and the doctor was very helpful.", name: "Rajesh T." },
  { id: "t-3", quote: "Best pet shop in Kathmandu — fast delivery every time.", name: "Anita M." },
];

export const BLOG_POSTS: MockBlogPost[] = [
  { id: "blog-1", date: "Sep 2026", title: "5 Signs Your Dog Needs a Vet Visit" },
  { id: "blog-2", date: "Aug 2026", title: "How to Choose the Right Food for Your Cat" },
  { id: "blog-3", date: "Aug 2026", title: "A Guide to Microchipping Your Pet" },
];
