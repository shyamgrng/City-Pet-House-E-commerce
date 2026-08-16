import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

// Catalog content transcribed from the design prototype's `products()` /
// `petFood()` / `brands()` state (design/CPH Phase1 Prototype.dc.html) so
// the storefront renders real copy instead of lorem ipsum while real
// photography is still pending (see docs/ARCHITECTURE_PROPOSAL.md §10).
const brands = ["Focus", "Bairo", "Himalaya", "Whiskas", "Pedigree", "Royal Canin", "ProLine", "Reflex"];

const catalogProducts: Array<{ name: string; price: number; category: string; badge?: string }> = [
  { name: "Adjustable Dog Collar", price: 450, category: "Pet Accessories", badge: "New" },
  { name: "Retractable Leash 5m", price: 890, category: "Pet Accessories" },
  { name: "Travel Carrier Bag", price: 2300, category: "Pet Accessories" },
  { name: "Stainless Steel Feeding Bowl", price: 380, category: "Pet Accessories", badge: "Sale" },
  { name: "Puppy Training Pads (30pc)", price: 990, category: "Pet Accessories" },
  { name: "Pet ID Tag", price: 180, category: "Pet Accessories" },
  { name: "Elevated Pet Bed", price: 1850, category: "Pet Accessories" },
  { name: "Cat Litter Box", price: 1450, category: "Pet Accessories" },
  { name: "Dog Knit Sweater", price: 950, category: "Fashion Wear", badge: "New" },
  { name: "Pet Raincoat", price: 1150, category: "Fashion Wear" },
  { name: "Cat Bandana Set", price: 320, category: "Fashion Wear" },
  { name: "Winter Puppy Hoodie", price: 1050, category: "Fashion Wear", badge: "Sale" },
  { name: "Festive Bowtie Collar", price: 380, category: "Fashion Wear" },
  { name: "Dog Denim Jacket", price: 1300, category: "Fashion Wear" },
  { name: "Pet Party Costume", price: 780, category: "Fashion Wear" },
  { name: "Cooling Vest for Dogs", price: 1600, category: "Fashion Wear" },
  { name: "Rope Tug Toy", price: 350, category: "Pet Toys", badge: "New" },
  { name: "Cat Feather Wand", price: 240, category: "Pet Toys" },
  { name: "Interactive Ball Feeder", price: 720, category: "Pet Toys" },
  { name: "Squeaky Plush Toy", price: 290, category: "Pet Toys", badge: "Sale" },
  { name: "Catnip Mouse Toy Set", price: 260, category: "Pet Toys" },
  { name: "Puzzle Treat Dispenser", price: 850, category: "Pet Toys" },
  { name: "Chew Bone Toy", price: 410, category: "Pet Toys" },
  { name: "Laser Pointer Toy", price: 320, category: "Pet Toys" },
  { name: "Himalaya Nefrotec Tablets", price: 650, category: "Pet Supplement", badge: "New" },
  { name: "Joint Care Chewables", price: 980, category: "Pet Supplement" },
  { name: "Omega-3 Skin & Coat Oil", price: 1150, category: "Pet Supplement" },
  { name: "Multivitamin Syrup", price: 540, category: "Pet Supplement", badge: "Sale" },
  { name: "Probiotic Digestive Aid", price: 720, category: "Pet Supplement" },
  { name: "Calcium Bone Booster", price: 610, category: "Pet Supplement" },
  { name: "Deworming Tablets", price: 320, category: "Pet Supplement" },
  { name: "Immunity Boost Powder", price: 880, category: "Pet Supplement" },
  { name: "Pet Shampoo 250ml", price: 420, category: "Grooming Supplies", badge: "New" },
  { name: "Deshedding Tool", price: 850, category: "Grooming Supplies" },
  { name: "Nail Clipper Set", price: 390, category: "Grooming Supplies" },
  { name: "Slicker Brush", price: 460, category: "Grooming Supplies", badge: "Sale" },
  { name: "Pet Cologne Spray", price: 550, category: "Grooming Supplies" },
  { name: "Ear Cleaning Solution", price: 340, category: "Grooming Supplies" },
  { name: "Grooming Comb", price: 290, category: "Grooming Supplies" },
  { name: "Pet Wipes (80pc)", price: 380, category: "Grooming Supplies" },
];

const petFoodProducts: Array<{ name: string; price: number; badge?: string }> = [
  { name: "Focus Puppy Food 1.2kg", price: 1300, badge: "New" },
  { name: "Bairo Adult Dog Food 3kg", price: 1200 },
  { name: "Whiskas Adult Cat Food 1.2kg", price: 980 },
  { name: "Focus Starter 1.2kg", price: 1200 },
  { name: "Rabbit Pellet Food 1kg", price: 650 },
  { name: "Fish Flake Food 200g", price: 380, badge: "Sale" },
];

const petListings = [
  { breed: "Pug", species: "Dog", sex: "Male", age: "8 wks", price: 30000, deliveryFee: 1500, tags: ["Vaccinated", "Dewormed"] },
  { breed: "Siberian Husky", species: "Dog", sex: "Male", age: "9 wks", price: 55000, deliveryFee: 2000, tags: ["Vaccinated", "Dewormed"] },
  { breed: "Persian Kitten", species: "Cat", sex: "Female", age: "10 wks", price: 18000, deliveryFee: 1000, tags: ["Vaccinated", "Dewormed"] },
  { breed: "Siamese Kitten", species: "Cat", sex: "Male", age: "9 wks", price: 15000, deliveryFee: 1000, tags: ["Vaccinated"] },
  { breed: "Holland Lop Rabbit", species: "Small Pets", sex: "Female", age: "3 months", price: 4500, deliveryFee: 500, tags: ["Dewormed"] },
  { breed: "Syrian Hamster", species: "Small Pets", sex: "Male", age: "2 months", price: 1200, deliveryFee: 300, tags: ["Vet Checked"] },
  { breed: "Sun Conure", species: "Birds", sex: "Male", age: "4 months", price: 12000, deliveryFee: 800, tags: ["Vet Checked"] },
  { breed: "Lovebird Pair", species: "Birds", sex: "Pair", age: "6 months", price: 6500, deliveryFee: 600, tags: ["Vet Checked"] },
  { breed: "Koi Fish (Set of 5)", species: "Fish", sex: "—", age: "6 months", price: 3500, deliveryFee: 400, tags: ["Vet Checked"] },
  { breed: "Betta Fish", species: "Fish", sex: "Male", age: "3 months", price: 600, deliveryFee: 200, tags: [] },
];

async function main() {
  await prisma.orderIdSequence.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nextVal: 1045 }, // continues past the prototype's last sample order, ORD-1045
  });

  await prisma.webVetSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, active: true },
  });

  await Promise.all(
    catalogProducts.map((p, i) =>
      prisma.product.upsert({
        where: { sku: `SEED-${i.toString().padStart(3, "0")}` },
        update: {},
        create: {
          sku: `SEED-${i.toString().padStart(3, "0")}`,
          name: p.name,
          category: p.category,
          brand: brands[i % brands.length],
          price: p.price,
          qty: 20,
          images: [],
          tags: [],
          rating: 3.5 + ((i * 37) % 16) / 10,
          badge: p.badge ?? null,
          todaysDeal: p.badge === "Sale",
          homeCategoryPlacement: p.badge === "Sale" ? "today-deals" : p.category === "Fashion Wear" ? "fashion-wear" : null,
        },
      }),
    ),
  );

  await Promise.all(
    petFoodProducts.map((p, i) =>
      prisma.product.upsert({
        where: { sku: `SEED-FOOD-${i}` },
        update: {},
        create: {
          sku: `SEED-FOOD-${i}`,
          name: p.name,
          category: "Pet Food",
          brand: brands[i % brands.length],
          price: p.price,
          qty: 20,
          images: [],
          tags: [],
          rating: 4 + (i % 10) / 10,
          badge: p.badge ?? null,
          todaysDeal: p.badge === "Sale",
          homeCategoryPlacement: "pet-food",
        },
      }),
    ),
  );

  await Promise.all(
    petListings.map((pet, i) =>
      prisma.petListing.upsert({
        where: { id: `seed-pet-${i}` },
        update: {},
        create: { id: `seed-pet-${i}`, ...pet, images: [], videos: [] },
      }),
    ),
  );

  // Demo pet-owner account for local testing (matches the prototype's default signed-in profile).
  const demoPassword = await argon2.hash("password123");
  const demoOwner = await prisma.user.upsert({
    where: { email: "eva.gurung@gmail.com" },
    update: {},
    create: {
      email: "eva.gurung@gmail.com",
      phone: "+977 9841112233",
      passwordHash: demoPassword,
      role: "PET_OWNER",
      petOwnerProfile: {
        create: {
          name: "Eva Gurung",
          addresses: {
            create: [
              {
                label: "Primary Address",
                address: "Boudha, Gokarneshwor-6, Kathmandu",
                phone: "+977 9851313717",
                altPhone: "+977 9801122334",
                isPrimary: true,
              },
              {
                label: "Alternative Address",
                address: "Baneshwor-10, Kathmandu",
                phone: "+977 9812345678",
                altPhone: "+977 9845123456",
                isPrimary: false,
              },
            ],
          },
        },
      },
    },
    include: { petOwnerProfile: true },
  });

  const ownerProfileId = demoOwner.petOwnerProfile!.id;

  const adoptionSeed = [
    { name: "Kalu", breed: "Mixed Breed (Local)", age: "1.5 yrs", sex: "Male", vaccinationStatus: "Rabies, DHPPiL — up to date", address: "Boudha, Gokarneshwor-6, Kathmandu", description: "Friendly, house-trained, good with kids. Owner relocating abroad.", contact: "+977 9841122334" },
    { name: "Milo", breed: "Labrador Mix", age: "3 yrs", sex: "Male", vaccinationStatus: "Rabies — up to date, DHPPiL due next month", address: "Baneshwor-10, Kathmandu", description: "Calm and loyal, needs a yard to play in. Vaccinated & neutered.", contact: "+977 9812233445" },
    { name: "Chandni", breed: "Indie", age: "8 months", sex: "Female", vaccinationStatus: "First round complete, booster pending", address: "Patan, Lalitpur", description: "Energetic pup, great with other dogs. Looking for an active family.", contact: "+977 9860011223" },
  ];

  for (const post of adoptionSeed) {
    const exists = await prisma.adoptionPost.findFirst({ where: { name: post.name, postedById: ownerProfileId } });
    if (!exists) {
      await prisma.adoptionPost.create({ data: { ...post, photos: [], postedById: ownerProfileId } });
    }
  }

  // eslint-disable-next-line no-console
  console.log("Seed complete. Demo pet-owner login: eva.gurung@gmail.com / password123");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
