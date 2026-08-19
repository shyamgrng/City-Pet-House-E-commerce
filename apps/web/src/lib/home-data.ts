export type HomeProduct = {
  name: string;
  price: string;
  badge?: string;
  badgeColor?: string;
};

export const categories = [
  { name: "Dog", bg: "#1996C8", slug: "dog" },
  { name: "Cat", bg: "#1F7A4D", slug: "cat" },
  { name: "Small Pets", bg: "#D64545", slug: "small-pets" },
  { name: "Birds", bg: "#C88A19", slug: "birds" },
  { name: "Fish", bg: "#5B6773", slug: "fish" },
];

export const availablePuppies = [
  { breed: "Pug", sex: "Male", age: "8 wks", price: "Rs. 30,000" },
  { breed: "Siberian Husky", sex: "Male", age: "9 wks", price: "Rs. 55,000" },
  { breed: "Persian Kitten", sex: "Female", age: "10 wks", price: "Rs. 18,000" },
  { breed: "Siamese Kitten", sex: "Male", age: "9 wks", price: "Rs. 15,000" },
  { breed: "Holland Lop Rabbit", sex: "Female", age: "3 months", price: "Rs. 4,500" },
  { breed: "Syrian Hamster", sex: "Male", age: "2 months", price: "Rs. 1,200" },
  { breed: "Sun Conure", sex: "Male", age: "4 months", price: "Rs. 12,000" },
  { breed: "Lovebird Pair", sex: "Pair", age: "6 months", price: "Rs. 6,500" },
  { breed: "Koi Fish (Set of 5)", sex: "—", age: "6 months", price: "Rs. 3,500" },
  { breed: "Betta Fish", sex: "Male", age: "3 months", price: "Rs. 600" },
];

export const healthCareItems = [
  {
    icon: "/assets/icon-microchipping.png",
    title: "Microchipping",
    desc: "Ensure your contact details are always with your pet.",
  },
  {
    icon: "/assets/icon-vaccinations.png",
    title: "Vaccinations",
    desc: "Protect your pet from common infectious diseases.",
  },
  {
    icon: "/assets/icon-desexing.png",
    title: "Desexing",
    desc: "Prevent unwanted pregnancies and reduce health risks.",
  },
  {
    icon: "/assets/icon-surgery.png",
    title: "Clinical Surgery",
    desc: "Expert surgical care backed by experienced vets.",
  },
  {
    icon: "/assets/icon-grooming.png",
    title: "Pet Grooming",
    desc: "Keep your pet looking and feeling their very best.",
  },
];

export const petFood: HomeProduct[] = [
  { name: "Focus Puppy Food 1.2kg", price: "Rs. 1,300", badge: "New", badgeColor: "#1996C8" },
  { name: "Bairo Adult Dog Food 3kg", price: "Rs. 1,200" },
  { name: "Whiskas Adult Cat Food 1.2kg", price: "Rs. 980" },
  { name: "Focus Starter 1.2kg", price: "Rs. 1,200" },
  { name: "Rabbit Pellet Food 1kg", price: "Rs. 650" },
  { name: "Fish Flake Food 200g", price: "Rs. 380", badge: "Sale", badgeColor: "#D64545" },
];

export const petAccessories: HomeProduct[] = [
  { name: "Clumping Bentonite Cat Litter 10L", price: "Rs. 1,470" },
  { name: "Adjustable Dog Collar", price: "Rs. 450", badge: "New", badgeColor: "#1996C8" },
  { name: "Retractable Leash 5m", price: "Rs. 890" },
  { name: "Travel Carrier Bag", price: "Rs. 2,300" },
  { name: "Stainless Steel Feeding Bowl", price: "Rs. 380", badge: "Sale", badgeColor: "#D64545" },
  { name: "Puppy Training Pads (30pc)", price: "Rs. 990" },
];

export const fashionWear: HomeProduct[] = [
  { name: "Dog Knit Sweater", price: "Rs. 950", badge: "New", badgeColor: "#1996C8" },
  { name: "Pet Raincoat", price: "Rs. 1,150" },
  { name: "Cat Bandana Set", price: "Rs. 320" },
  { name: "Winter Puppy Hoodie", price: "Rs. 1,050", badge: "Sale", badgeColor: "#D64545" },
  { name: "Festive Bowtie Collar", price: "Rs. 380" },
  { name: "Dog Denim Jacket", price: "Rs. 1,300" },
];

export const petToys: HomeProduct[] = [
  { name: "Rope Tug Toy", price: "Rs. 350", badge: "New", badgeColor: "#1996C8" },
  { name: "Cat Feather Wand", price: "Rs. 240" },
  { name: "Interactive Ball Feeder", price: "Rs. 720" },
  { name: "Squeaky Plush Toy", price: "Rs. 290", badge: "Sale", badgeColor: "#D64545" },
  { name: "Catnip Mouse Toy Set", price: "Rs. 260" },
  { name: "Puzzle Treat Dispenser", price: "Rs. 850" },
];

export const groomingAccessories: HomeProduct[] = [
  { name: "Pet Shampoo 250ml", price: "Rs. 420" },
  { name: "Dog Grooming Brush", price: "Rs. 480" },
  { name: "Deshedding Tool", price: "Rs. 850", badge: "New", badgeColor: "#1996C8" },
  { name: "Nail Clipper Set", price: "Rs. 390" },
  { name: "Grooming Wipes (50pc)", price: "Rs. 350" },
  { name: "Detangling Comb", price: "Rs. 300", badge: "Sale", badgeColor: "#D64545" },
];

export const brands = ["Focus", "Bairo", "Himalaya", "Whiskas", "Pedigree", "Royal Canin", "ProLine", "Reflex"];

export const testimonials = [
  {
    quote:
      "The vet was on time and friendly with my dog — it responded to treatment right away. Will use this service again.",
    name: "Lin Hollywood",
  },
  {
    quote: "They treat every pet like family. Timely, exceptional service — highly recommend for anything your pet needs.",
    name: "Aarya Acharya",
  },
  {
    quote: "Wonderful visit for our dog. Reasonable prices and great staff — thank you for the good service.",
    name: "Sanju Timalsina",
  },
];

export const blogPosts = [
  { date: "Mar 20, 2026", title: "Spring Alert: Is Your Dog Itching? Managing Skin Allergies" },
  { date: "Mar 8, 2026", title: "Parasite Prevention: 5 Critical Tips to Protect Your Pet" },
  { date: "Feb 26, 2026", title: "First Aid Tips Every Pet Owner Should Know" },
  { date: "Feb 12, 2026", title: "New Puppy Checklist: Vaccination Schedule & What to Buy" },
];

export const footerServiceLinks = [
  "Dog & Cat Microchipping",
  "Dog & Cat Vaccination",
  "Pet Grooming",
  "Surgery",
  "Puppies Buying & Selling",
  "Clinical Treatment",
];

export const footerGeneralLinks = [
  "About Us",
  "Career",
  "Pet Tag Archive",
  "Microchipping Archive",
  "Dog Breed Archive",
  "Terms & Conditions",
  "Privacy Policy",
];

export const footerQuickLinks = ["Home", "Shop", "Pets Available", "Adoption", "Web Vet"];
