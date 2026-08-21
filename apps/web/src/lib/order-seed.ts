import { catalogSeed } from "@/lib/catalog-seed";
import type { Order } from "@/lib/order-types";

function find(name: string) {
  const p = catalogSeed.find((c) => c.name === name);
  if (!p) throw new Error(`order-seed: product not found: ${name}`);
  return p;
}

const focusPuppyFood = find("Elevated Pet Bed");
const nefrotec = find("Himalaya Nefrotec Tablets");
const leash = find("Retractable Leash 5m");
const litter = find("Clumping Bentonite Cat Litter 10L");
const collar = find("Adjustable Dog Collar");

export const orderSeed: Order[] = [
  {
    id: "ORD-2045",
    ownerId: "acc-seed01",
    ownerName: "Aarya Acharya",
    ownerPhone: "+977 9841112233",
    ownerEmail: "aarya.acharya@example.com",
    address: "Baneshwor, Kathmandu",
    items: [{ productId: focusPuppyFood.id, name: focusPuppyFood.name, price: focusPuppyFood.price, qty: 1 }],
    subtotal: focusPuppyFood.price,
    deliveryFee: 100,
    total: focusPuppyFood.price + 100,
    status: "Receipt Uploaded",
    receiptPhoto: "",
    createdAt: Date.now() - 3 * 60 * 60 * 1000,
  },
  {
    id: "ORD-2041",
    ownerId: "acc-seed02",
    ownerName: "Nisha Karki",
    ownerPhone: "+977 9812223344",
    ownerEmail: "nisha.karki@example.com",
    address: "Jawalakhel, Lalitpur",
    items: [
      { productId: nefrotec.id, name: nefrotec.name, price: nefrotec.price, qty: 2 },
      { productId: litter.id, name: litter.name, price: litter.price, qty: 1 },
    ],
    subtotal: nefrotec.price * 2 + litter.price,
    deliveryFee: 100,
    total: nefrotec.price * 2 + litter.price + 100,
    status: "Receipt Uploaded",
    receiptPhoto: "",
    createdAt: Date.now() - 20 * 60 * 60 * 1000,
  },
  {
    id: "ORD-2040",
    ownerId: "acc-seed03",
    ownerName: "Bikram Shahi",
    ownerPhone: "+977 9803334455",
    ownerEmail: "bikram.shahi@example.com",
    address: "Chabahil, Kathmandu",
    items: [{ productId: collar.id, name: collar.name, price: collar.price, qty: 1 }],
    subtotal: collar.price,
    deliveryFee: 100,
    total: collar.price + 100,
    status: "Payment Rejected",
    receiptPhoto: "",
    rejectReason: "Receipt unreadable — please re-upload a clear screenshot",
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "ORD-2030",
    ownerId: "acc-seed02",
    ownerName: "Nisha Karki",
    ownerPhone: "+977 9812223344",
    ownerEmail: "nisha.karki@example.com",
    address: "Jawalakhel, Lalitpur",
    items: [{ productId: leash.id, name: leash.name, price: leash.price, qty: 1 }],
    subtotal: leash.price,
    deliveryFee: 100,
    total: leash.price + 100,
    status: "Delivered",
    receiptPhoto: "",
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    approvedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    deliveredAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
  },
];
