import { brandNames, slugify, type Product } from "./catalog-types";

type SeedRow = [
  name: string,
  category: string,
  price: number,
  qty: number,
  badge: Product["badge"],
  hotDiscount: number,
];

// Order matches the design's products() catalog exactly (Pet Accessories, Fashion Wear,
// Pet Toys, Pet Supplement, Grooming Supplies — Pet Food is a category option with no
// catalog items yet, matching the design). Brand is assigned by cycling brandNames over
// this array index, same as the prototype's `.map((p,i) => ({...p, brand: brands[i%len]}))`.
const rows: SeedRow[] = [
  // Pet Accessories (9)
  ["Clumping Bentonite Cat Litter 10L", "Pet Accessories", 1470, 24, "", 0],
  ["Adjustable Dog Collar", "Pet Accessories", 450, 3, "New", 10],
  ["Retractable Leash 5m", "Pet Accessories", 890, 18, "", 25],
  ["Travel Carrier Bag", "Pet Accessories", 2300, 5, "", 0],
  ["Stainless Steel Feeding Bowl", "Pet Accessories", 380, 24, "Sale", 0],
  ["Puppy Training Pads (30pc)", "Pet Accessories", 990, 2, "", 0],
  ["Pet ID Tag", "Pet Accessories", 180, 12, "", 0],
  ["Elevated Pet Bed", "Pet Accessories", 1850, 30, "", 0],
  ["Cat Litter Box", "Pet Accessories", 1450, 8, "", 0],
  // Fashion Wear (8)
  ["Dog Knit Sweater", "Fashion Wear", 950, 15, "New", 20],
  ["Pet Raincoat", "Fashion Wear", 1150, 6, "", 15],
  ["Cat Bandana Set", "Fashion Wear", 320, 0, "", 0],
  ["Winter Puppy Hoodie", "Fashion Wear", 1050, 22, "Sale", 0],
  ["Festive Bowtie Collar", "Fashion Wear", 380, 7, "", 0],
  ["Dog Denim Jacket", "Fashion Wear", 1300, 16, "", 0],
  ["Pet Party Costume", "Fashion Wear", 780, 9, "", 0],
  ["Cooling Vest for Dogs", "Fashion Wear", 1600, 25, "", 0],
  // Pet Toys (8)
  ["Rope Tug Toy", "Pet Toys", 350, 4, "New", 15],
  ["Cat Feather Wand", "Pet Toys", 240, 19, "", 0],
  ["Interactive Ball Feeder", "Pet Toys", 720, 11, "", 20],
  ["Squeaky Plush Toy", "Pet Toys", 290, 14, "Sale", 0],
  ["Catnip Mouse Toy Set", "Pet Toys", 260, 20, "", 0],
  ["Puzzle Treat Dispenser", "Pet Toys", 850, 20, "", 0],
  ["Chew Bone Toy", "Pet Toys", 410, 20, "", 0],
  ["Laser Pointer Toy", "Pet Toys", 320, 20, "", 0],
  // Pet Supplement (8)
  ["Himalaya Nefrotec Tablets", "Pet Supplement", 650, 20, "New", 0],
  ["Joint Care Chewables", "Pet Supplement", 980, 20, "", 0],
  ["Omega-3 Skin & Coat Oil", "Pet Supplement", 1150, 20, "", 0],
  ["Multivitamin Syrup", "Pet Supplement", 540, 20, "Sale", 0],
  ["Probiotic Digestive Aid", "Pet Supplement", 720, 20, "", 0],
  ["Calcium Bone Booster", "Pet Supplement", 610, 20, "", 0],
  ["Deworming Tablets", "Pet Supplement", 320, 20, "", 0],
  ["Immunity Boost Powder", "Pet Supplement", 880, 20, "", 0],
  // Grooming Supplies (8)
  ["Pet Shampoo 250ml", "Grooming Supplies", 420, 20, "New", 0],
  ["Deshedding Tool", "Grooming Supplies", 850, 20, "", 0],
  ["Nail Clipper Set", "Grooming Supplies", 390, 20, "", 0],
  ["Slicker Brush", "Grooming Supplies", 460, 20, "Sale", 0],
  ["Pet Cologne Spray", "Grooming Supplies", 550, 20, "", 0],
  ["Ear Cleaning Solution", "Grooming Supplies", 340, 20, "", 0],
  ["Grooming Comb", "Grooming Supplies", 290, 20, "", 0],
  ["Pet Wipes (80pc)", "Grooming Supplies", 380, 20, "", 0],
];

export const catalogSeed: Product[] = rows.map(([name, category, price, qty, badge, hotDiscount], i) => ({
  id: slugify(name),
  name,
  desc: "",
  category,
  brand: brandNames[i % brandNames.length],
  price,
  qty,
  badge,
  hotSale: hotDiscount > 0,
  hotDiscount,
  todaysDeal: hotDiscount > 0,
  outOfStock: qty === 0,
}));
