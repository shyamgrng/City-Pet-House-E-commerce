export const sidebarDefs: { key: string; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "pettagarchive", label: "Pet Tag Archive" },
  { key: "microchiprecords", label: "Microchipping Records" },
  { key: "deliveries", label: "Deliveries" },
  { key: "vetconsults", label: "Vet Consults" },
  { key: "petavailable", label: "Pet Available" },
  { key: "shop", label: "Shop" },
  { key: "b2bsupply", label: "B2B Supply" },
  { key: "pages", label: "Pages" },
  { key: "career", label: "Career" },
  { key: "notifications", label: "Notifications" },
  { key: "finance", label: "Finance" },
  { key: "accounts", label: "Accounts" },
  { key: "users", label: "Users" },
  { key: "settings", label: "Settings" },
];

export const sidebarBadges: Record<string, { count: number; color: string }> = {
  deliveries: { count: 5, color: "#D64545" },
  career: { count: 3, color: "#C9962B" },
  notifications: { count: 1, color: "#C9962B" },
};

// ---- Dashboard ----
export const liveStatusCards = [
  { label: "Pending Deliveries", value: 8, bg: "#EAF4F9", border: "#CFE6F1", color: "#146A8C", dot: "#1996C8" },
  { label: "Pending Vet Consults", value: 0, bg: "#F5EEFB", border: "#E2CFF2", color: "#6B3FA0", dot: "#8E4FD6" },
];

export const pendingJobsBySection = [
  { label: "Payment Queue", value: 2, color: "#C9962B" },
  { label: "Orders to Process", value: 3, color: "#1996C8" },
  { label: "Awaiting Dispatch", value: 3, color: "#7A56C8" },
  { label: "Active Refunds", value: 0, color: "#D64545" },
  { label: "Vet Payment Approvals", value: 0, color: "#C9962B" },
  { label: "Pending Doctor/Courier/B2B Registrations", value: 0, color: "#7A56C8" },
  { label: "Out-of-Stock Products", value: 1, color: "#D64545" },
  { label: "Active Adoption Posts", value: 3, color: "#1F7A4D" },
];

export const dashboardStatCards = [
  { label: "Products Listed", value: "42" },
  { label: "Available Puppies", value: "10" },
  { label: "Reserved Puppies", value: "0" },
  { label: "Pending Payments", value: "4" },
  { label: "Items to Dispatch", value: "3" },
  { label: "Animals Listed on Site", value: "13" },
  { label: "Today's Revenue", value: "Rs. 18,400" },
  { label: "Total Revenue", value: "Rs. 4,82,600" },
  { label: "Registered Clients", value: "312" },
];

export const weeklyOrders = [
  { label: "Mon", count: 6 }, { label: "Tue", count: 9 }, { label: "Wed", count: 5 },
  { label: "Thu", count: 12 }, { label: "Fri", count: 15 }, { label: "Sat", count: 21 }, { label: "Sun", count: 14 },
];
export const weeklyOrdersTotal = weeklyOrders.reduce((a, b) => a + b.count, 0);

export const weeklyInteractions = [
  { label: "Mon", count: 14 }, { label: "Tue", count: 19 }, { label: "Wed", count: 11 },
  { label: "Thu", count: 23 }, { label: "Fri", count: 27 }, { label: "Sat", count: 34 }, { label: "Sun", count: 22 },
];
export const weeklyInteractionsTotal = weeklyInteractions.reduce((a, b) => a + b.count, 0);

export const lowStockItems = [
  { name: "Focus Puppy Food 1.2kg", stock: 3 },
  { name: "Himalaya Nefrotec Tablets", stock: 5 },
  { name: "Clumping Bentonite Cat Litter 10L", stock: 2 },
];

export const recentActivity = [
  { text: "New order ORD-1046 placed — Rs. 2,150", time: "8 mins ago" },
  { text: "Payment approved for ORD-1043", time: "32 mins ago" },
  { text: 'New adoption post — "Kalu" (Mixed Breed)', time: "1 hr ago" },
  { text: "Vet consult request — Dr. Sujata Rai", time: "2 hrs ago" },
];

// ---- Deliveries ----
// Payment Queue, Orders, Dispatch, Delivery, Cancelled, Rejected, and Reports (stats, revenue
// by category, top products, activity log) all now read live from OrderContext + DeliveryContext
// + CatalogContext — see src/app/admin/(dashboard)/deliveries/page.tsx. Refunds stays static
// (empty) since no refund flow has been built yet.
export const refundedOrdersData: { id: string; client: string; amount: string; type: string }[] = [];

// Vet Consults (doctors + bookings) now reads live from VetContext (src/context/VetContext.tsx) —
// see src/app/admin/(dashboard)/vet-consults/page.tsx and the public /vet booking flow.

// Shop / Stock now reads live from CatalogContext (src/context/CatalogContext.tsx) — see
// src/app/admin/(dashboard)/shop/page.tsx, which is wired to the same product data the
// public /shop page renders.

// ---- Accounts ----
// All account stats and lists (clients, doctors, couriers, B2B, staff) now read live from
// AuthContext, doctor-auth-types.ts, b2b-auth-types.ts, courier-auth-types.ts and adminUsers
// above — see src/app/admin/(dashboard)/accounts/page.tsx — since those are the same seeded
// credentials that sign in at /signin, /doctor/login, /b2b/login and /courier/login.

// ---- Finance ----
export const financeOverview = {
  totalIncome: "Rs. 26,000",
  totalRefunds: "-Rs. 0",
  cancelled: "Rs. 1,600",
  netRevenue: "Rs. 26,000",
  receivable: "Rs. 0",
  payable: "Rs. 13,950",
  potentialProfit: "Rs. 481,780",
};
export const financeFlows = [
  { label: "Income", amount: "Rs. 26,000", pct: 100, color: "#1F7A4D" },
  { label: "Refunds", amount: "Rs. 0", pct: 0, color: "#D64545" },
  { label: "Cancelled", amount: "Rs. 1,600", pct: 6, color: "#8A96A3" },
  { label: "Payable", amount: "Rs. 13,950", pct: 54, color: "#7A56C8" },
];

// ---- Users / Roles ----
export const adminUsers = [
  { name: "Admin User", email: "admin@citypethouse.com", role: "Admin", status: "Active" },
  { name: "Sabin Karki", email: "sabin@citypethouse.com", role: "Staff", status: "Active" },
];
export const rolePerms = [
  { role: "Admin", perms: [true, true, true, true, true, true] },
  { role: "Manager", perms: [true, true, true, true, true, false] },
  { role: "Staff", perms: [true, true, true, true, false, false] },
  { role: "B2B User", perms: [false, false, false, true, false, false] },
];
export const roleColumns = ["Dashboard", "Deliveries", "Vet Consults", "Shop", "Finance", "Users"];

// ---- Pet Tag Archive ----
export const petTagRecords = [
  { name: "Cooki", info: "Male · 4 months", breed: "German Shepard", color: "Black & Tan", owner: "Shyam Gurung", phone: "+977 9851313717", tag: "9ZG36R6B", scans: 10 },
  { name: "Uni", info: "Male · 5 years, 10 months", breed: "Japanese Spitz", color: "White", owner: "Sabita Thapa", phone: "+977 9842760300", tag: "79VHFBPM", scans: 6 },
  { name: "Maggie", info: "Female · 6 years, 7 months", breed: "Golden Retriever", color: "Golden", owner: "Shyam Gurung", phone: "+977 9851313717", tag: "T1EHDCF", scans: 0 },
  { name: "Molly", info: "Female · 6 years, 7 months", breed: "Golden Retriever", color: "Golden", owner: "Shyam Gurung", phone: "+977 9851313717", tag: "52D0FPCO", scans: 13 },
  { name: "Shree", info: "Female · 6 years, 7 months", breed: "Doberman", color: "Black & Tan", owner: "Shyam Gurung", phone: "+977 9851313717", tag: "95CC9CK5", scans: 2 },
];

// ---- Microchipping Records ----
export const microchipRecords = [
  { chip: "981098212345671", pet: "Cooki · Male, 4 months", breed: "German Shepard", color: "Black & Tan", owner: "Shyam Gurung", phone: "+977 9851313717", location: "Gokarneshwor, Ward 6, Kathmandu" },
  { chip: "981098254321098", pet: "Uni · Male, 5 years, 10 months", breed: "Japanese Spitz", color: "White", owner: "Sabita Thapa", phone: "+977 9842760300", location: "Kathmandu Metropolitan, Ward 3, Kathmandu" },
];

// Pet Available now reads live from PetContext (src/context/PetContext.tsx) — see
// src/app/admin/(dashboard)/pet-available/page.tsx, shared with the public /pets page
// and the Home page's Available Puppies rail.

// ---- Career ----
export const careerFolders = [
  { key: "inbox", label: "Inbox", badge: 3 },
  { key: "clinic", label: "Vet Technician (Clinic)", badge: 0 },
  { key: "field", label: "Vet Technician (Field)", badge: 0 },
  { key: "grooming", label: "Dog Grooming (Grooming Ghar)", badge: 0 },
  { key: "rejected", label: "Rejected", badge: 0 },
];
export const careerApplications = [
  { name: "Sushant Karki", email: "sushant.karki@gmail.com", phone: "+977 9801234567", role: "Vet Technician (Clinic)" },
  { name: "Nisha Maharjan", email: "nisha.mhrj@gmail.com", phone: "+977 9812345678", role: "Vet Technician (Field)" },
  { name: "Roshani Tamang", email: "roshani.tmg@gmail.com", phone: "+977 9841234567", role: "Dog Grooming (Grooming Ghar)" },
];

// ---- Notifications ----
export const notificationTabs = [
  { key: "dashboard", label: "Dashboard", badge: 0 },
  { key: "templates", label: "Templates", badge: 2 },
  { key: "campaigns", label: "Campaigns", badge: 1 },
  { key: "automation", label: "Automation", badge: 0 },
  { key: "audience", label: "Audience", badge: 0 },
  { key: "logs", label: "Logs", badge: 1 },
  { key: "preferences", label: "Preferences", badge: 0 },
];
export const notifStats = [
  { label: "Total Notifications Sent", value: "8" },
  { label: "Email Delivery Rate", value: "100%" },
  { label: "Push Delivery Rate", value: "67%" },
  { label: "In-App Delivery Rate", value: "100%" },
  { label: "Open Rate", value: "43%" },
  { label: "Click Rate", value: "14%" },
  { label: "Failed Notifications", value: "1" },
  { label: "Scheduled Campaigns", value: "1" },
  { label: "Draft Templates", value: "2" },
];
export const notifRecentActivity = [
  { title: "Password Reset Code", meta: "sms · +977 98410xxxxx · Jul 10, 8:15 PM" },
  { title: "Doctor Approved Welcome", meta: "inapp · Dr. Anjali Gurung · Jul 12, 10:00 AM" },
  { title: "July Vaccination Reminder Push", meta: "push · 842 recipients · Jul 15, 9:00 AM" },
  { title: "Adoption Reservation Notice", meta: "push · Nisha Rana · Jul 21, 5:02 PM" },
  { title: "Career Application Ack", meta: "email · Suman K.C. · Jul 21, 4:45 PM" },
  { title: "Payment Approved — INV-2003", meta: "email · Raj Thapa · Jul 22, 2:10 PM" },
];
export const notifTopCampaigns = [{ name: "July Vaccination Reminder Push", stat: "Open 61% · Click 18%" }];

// ---- Pages list ----
export const pageEditorList = [
  { title: "Home", desc: "Hero, banners, headline & SEO" },
  { title: "Testimonials", desc: "Customer quotes shown on Home" },
  { title: "Services", desc: "Add, edit & image services shown site-wide", href: "/admin/pages/services" },
  { title: "Blog", desc: "Add, edit & image blog articles", href: "/admin/pages/blog" },
  { title: "About Us", desc: "Page title & body shown on the public About Us page" },
  { title: "Vet Consults", desc: "Walkthrough video/banner, headline & content on the public Vet Consults page" },
  { title: "Career", desc: "Intro text, headline & CTA on the public Career page" },
  { title: "Dog Breed Archive", desc: "Add, edit & remove breed entries shown on the public Dog Breed Archive page" },
  { title: "Contact Us", desc: "Intro text, info cards, map & form on the Contact page" },
  { title: "Terms & Conditions", desc: "Legal content shown on the public Terms & Conditions page" },
  { title: "Privacy Policy", desc: "Legal content shown on the public Privacy Policy page" },
  { title: "Return & Refund", desc: "Legal content shown on the public Return & Refund page" },
  { title: "How to Buy", desc: "Step-by-step buying guide shown on the public How to Buy page" },
  { title: "FAQ", desc: "Questions & answers shown on the public FAQ page" },
  { title: "Microchipping Archive", desc: "Banner, content sections & FAQs on the public Microchipping Archive page" },
  { title: "Pet Tag Archive", desc: "Banner, content sections & FAQs on the public Pet Tag Archive page" },
];

// ---- Settings ----
export const paymentMethods = [
  { name: "Fonepay", active: true },
  { name: "eSewa", active: true },
  { name: "Khalti", active: true },
];
