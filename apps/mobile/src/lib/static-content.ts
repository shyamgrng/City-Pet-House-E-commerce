// Real content pulled from the website's seed files (faq-seed.ts, how-to-buy-seed.ts,
// career-seed.ts, service-seed.ts, blog-seed.ts), so the "..." menu pages read the same as web.

export type FaqItem = { id: string; cat: string; q: string; a: string };
export const FAQ_ITEMS: FaqItem[] = [
  { id: "faq-1", cat: "Account & Registration", q: "Do I need an account to purchase products?", a: "Yes. Customers need to create an account before placing an order. Your account helps us manage your orders, delivery details, service bookings, and provide a better shopping experience." },
  { id: "faq-2", cat: "Account & Registration", q: "How do I create an account?", a: "You can create an account by clicking the Register/Login option and providing your name, email address, phone number, and password." },
  { id: "faq-3", cat: "Account & Registration", q: "Can I browse products without creating an account?", a: "Yes. You can browse our products and services without an account. However, account registration is required to purchase products or book services." },
  { id: "faq-5", cat: "Online Shopping & Products", q: "What products can I buy from City Pet House?", a: "You can purchase various pet care products including dog food, cat food, pet supplements, grooming products, toys, accessories, healthcare products, and other pet essentials." },
  { id: "faq-6", cat: "Online Shopping & Products", q: "How do I place an order?", a: "Create an account, select your products, add them to your cart, enter delivery information, complete payment through QR payment, upload your payment receipt, then wait for order confirmation." },
  { id: "faq-7", cat: "Online Shopping & Products", q: "Can I cancel my order?", a: "Yes. Orders can be cancelled within 12 hours of placing the order, provided the order has not been processed or dispatched." },
  { id: "faq-8", cat: "Payment", q: "What payment methods are available?", a: "Currently, City Pet House accepts QR-based digital payments. Scan the QR code, complete payment, upload payment receipt, and wait for payment verification." },
  { id: "faq-11", cat: "Delivery", q: "Where do you deliver?", a: "Currently, City Pet House delivers within Kathmandu, Lalitpur, and Bhaktapur." },
  { id: "faq-12", cat: "Delivery", q: "How long does delivery take?", a: "Our standard delivery target is within 24 hours after payment confirmation. In some situations, delivery may take up to 48 hours." },
  { id: "faq-14", cat: "Veterinary Consultation", q: "Can I consult a veterinarian online?", a: "Yes. City Pet House provides online veterinary consultation through video consultation, audio consultation, uploading pet photos, and uploading medical reports." },
  { id: "faq-16", cat: "Veterinary Consultation", q: "Can I use online consultation for emergencies?", a: "No. Online consultation is not suitable for emergencies. For emergencies, please contact our emergency support number or visit a veterinary clinic immediately." },
  { id: "faq-17", cat: "Grooming Services", q: "What grooming services do you provide?", a: "Bath and blow dry, hair trimming, deshedding, nail trimming, ear cleaning, hygiene grooming, tick and flea treatment, and professional pet grooming." },
  { id: "faq-20", cat: "Puppy Purchase", q: "Can I buy puppies online?", a: "Yes. City Pet House provides a responsible puppy purchasing platform. Customers can view available puppies and contact our team for further information." },
  { id: "faq-21", cat: "Puppy Purchase", q: "What age puppies are available for sale?", a: "Puppies will not be sold before 40 days of age." },
  { id: "faq-23", cat: "Pet Adoption", q: "Can I adopt pets through City Pet House?", a: "Yes. Our adoption platform helps connect pets needing homes with interested adopters." },
];

export type HowToBuyStep = { icon: string; title: string; desc: string; items: string[]; note?: string; benefits?: string };
export const HOW_TO_BUY_INTRO =
  "Shopping for your pet has never been easier. Follow these simple steps to order quality pet food, accessories, supplements, and pet care products from City Pet House.";
export const HOW_TO_BUY_STEPS: HowToBuyStep[] = [
  { icon: "👤", title: "Create Your City Pet House Account", desc: "To place an order, first create your customer account.", items: ["Click \"Register/Login\".", "Enter your name, email, phone number, and password.", "Login to start shopping."], benefits: "Track orders, save delivery details, view purchase history." },
  { icon: "🛒", title: "Browse and Select Pet Products", desc: "Explore our online store and choose products suitable for your pet.", items: ["Search for your required product.", "Read product details.", "Select quantity.", "Click \"Add to Cart\"."] },
  { icon: "📋", title: "Review Your Order", desc: "Before checkout, check selected products, confirm quantity, and review the total amount.", items: [] },
  { icon: "📍", title: "Provide Your Delivery Information", desc: "Enter your correct delivery details — name, contact number, address, and location.", items: [], note: "Please provide accurate contact details to ensure smooth delivery." },
  { icon: "📱", title: "Complete Your Payment", desc: "City Pet House uses secure QR-based digital payment.", items: ["Select QR Payment option.", "Scan the displayed QR code.", "Complete your payment.", "Save your payment confirmation screenshot."] },
  { icon: "📤", title: "Submit Your Payment Proof", desc: "After completing payment, upload your payment receipt and click Submit.", items: [], benefits: "Our team will verify your payment before processing your order." },
  { icon: "🚚", title: "Track Your Order Until Delivery", desc: "You'll receive updates: order received, payment verified, order confirmed, prepared, and dispatched.", items: [] },
];

export type ServiceItem = { id: string; name: string; desc: string };
export const SERVICES: ServiceItem[] = [
  { id: "svc-1", name: "Dog & Cat Microchipping", desc: "Quick, permanent ID for your pet's safety." },
  { id: "svc-2", name: "Dog & Cat Vaccination", desc: "Routine shots to protect against serious illness." },
  { id: "svc-3", name: "Pet Grooming", desc: "Bathing, trimming and coat care." },
  { id: "svc-4", name: "Surgery", desc: "Safe, professional veterinary surgery." },
  { id: "svc-5", name: "Puppies Buying & Selling", desc: "Browse verified breeds available now." },
  { id: "svc-6", name: "Clinical Treatment", desc: "Diagnosis and treatment at the clinic." },
  { id: "svc-7", name: "Home Treatment", desc: "We come to you for a calmer visit." },
  { id: "svc-8", name: "Lab Test", desc: "Blood, urine and other diagnostic tests." },
];

export type BlogPost = { id: string; title: string; date: string; author: string; excerpt: string };
export const BLOG_POSTS_FULL: BlogPost[] = [
  { id: "blog-1", title: "Spring Alert: Is Your Dog Itching? Managing Skin Allergies", date: "Mar 20, 2026", author: "Dr. Sujata Rai", excerpt: "Seasonal allergies are common in dogs and cats — here's how to spot the signs early and manage flare-ups at home." },
  { id: "blog-2", title: "Parasite Prevention: 5 Critical Tips to Protect Your Pet", date: "Mar 8, 2026", author: "Dr. Bikash Shrestha", excerpt: "Fleas, ticks and worms are year-round risks in Kathmandu Valley. A simple prevention routine keeps your pet safe." },
  { id: "blog-3", title: "First Aid Tips Every Pet Owner Should Know", date: "Feb 26, 2026", author: "Dr. Anjali Gurung", excerpt: "From minor cuts to choking, a few first-aid basics can make all the difference before you reach the clinic." },
  { id: "blog-4", title: "New Puppy Checklist: Vaccination Schedule & What to Buy", date: "Feb 12, 2026", author: "City Pet House Team", excerpt: "Bringing home a new puppy? Here's the essential first-month checklist every new owner needs." },
];

export type CareerJob = { id: string; title: string; tag: string; desc: string };
export const CAREER_HEADLINE = "Exciting opportunities and a rewarding career.";
export const CAREER_JOBS: CareerJob[] = [
  { id: "job-clinic", title: "Vet Technician (Clinic)", tag: "Full-time · Boudha Clinic", desc: "Assist our vets with checkups, vaccinations, minor procedures & patient care at our Boudha clinic." },
  { id: "job-field", title: "Vet Technician (Field)", tag: "Full-time · Kathmandu Valley", desc: "Travel to home visits across Kathmandu, Lalitpur & Bhaktapur for house-call consults and treatments." },
  { id: "job-grooming", title: "Dog Grooming (Grooming Ghar)", tag: "Full-time · Grooming Ghar", desc: "Bathing, styling, nail trims & coat care for dogs of all breeds at our Grooming Ghar studio." },
];

export type AdoptionPost = {
  id: string;
  name: string;
  breed: string;
  sex: string;
  age: string;
  vaccination: string;
  address: string;
  desc: string;
  contact: string;
  daysLeft: number;
};
export const ADOPTION_POSTS: AdoptionPost[] = [
  { id: "ad-1", name: "Bruno", breed: "Mixed Breed", sex: "Male", age: "1 year", vaccination: "Up to date", address: "Boudha, Kathmandu", desc: "Friendly and great with kids. House-trained.", contact: "+977 9801112233", daysLeft: 9 },
  { id: "ad-2", name: "Luna", breed: "Labrador Mix", sex: "Female", age: "8 months", vaccination: "1st dose done", address: "Patan, Lalitpur", desc: "Energetic pup looking for an active family.", contact: "+977 9807654321", daysLeft: 13 },
];

export type PetTagRecord = {
  tagId: string;
  petName: string;
  breed: string;
  color: string;
  sex: string;
  age: string;
  microchip?: string;
  ownerName: string;
  phone: string;
  altPhone?: string;
  address: string;
  notes?: string;
  scans: number;
};
export const PET_TAG_RECORDS: PetTagRecord[] = [
  {
    tagId: "CPH-1042",
    petName: "Max",
    breed: "Golden Retriever",
    color: "Golden",
    sex: "Male",
    age: "3 years",
    microchip: "941000012345678",
    ownerName: "Rajesh Thapa",
    phone: "+977 9841001001",
    altPhone: "+977 9801002002",
    address: "Baneshwor, Kathmandu",
    notes: "Needs daily thyroid medication — please call the owner if found.",
    scans: 4,
  },
];

export type MicrochipRecord = {
  chipNumber: string;
  petName: string;
  species: string;
  breed: string;
  ownerName: string;
  phone: string;
  address: string;
};
export const MICROCHIP_RECORDS: MicrochipRecord[] = [
  { chipNumber: "941000012345678", petName: "Max", species: "Dog", breed: "Golden Retriever", ownerName: "Rajesh Thapa", phone: "+977 9841001001", address: "Baneshwor, Kathmandu" },
];

export const LEGAL_TERMS = `City Pet House & Animal Clinic ("we", "us") provides pet products, veterinary consultation, adoption listings, and related services through our website and mobile app.

By using our services you agree to:
- Provide accurate account, order, and payment information
- Use QR-based payment and upload a genuine payment receipt for verification
- Accept that orders may be cancelled within 12 hours of placing them, before dispatch
- Understand that online vet consultation is not suitable for emergencies

We reserve the right to update these terms at any time. Continued use of our services means you accept the current version.`;

export const LEGAL_PRIVACY = `We collect the information you provide when creating an account, placing an order, booking a service, or contacting us — name, phone, email, address, and payment receipts.

This information is used to:
- Process and deliver your orders and bookings
- Verify payments
- Contact you about your account, orders, or consultations
- Improve our products and services

We do not sell your personal information to third parties. Payment receipts are used only for internal verification.`;

export const LEGAL_REFUND = `If your order or service cannot be fulfilled (e.g. an item is out of stock, or a vet consult cannot be completed), we will process a refund to your original payment method or offer store credit, your choice.

Refund requests should be raised within 7 days of the issue. Delivered products found to be damaged or incorrect are eligible for replacement or refund — please contact us with photos of the item within 48 hours of delivery.

Puppy/pet purchases follow a separate health-assurance policy — contact us directly for details.`;
