import type { AvailabilityMap, Doctor, VetBooking } from "@/lib/vet-types";
import { AVAILABILITY_SLOTS, next14Days } from "@/lib/vet-types";

export const doctorSeed: Doctor[] = [
  { id: "DR-1042", name: "Dr. Sujata Rai, BVSc & AH", qualification: "BVSc & AH, Tribhuvan University", nvcNumber: "NVC-1042", online: true, verified: true, consults: 4, completed: 3, feeRs: 800 },
  { id: "DR-0876", name: "Dr. Bikash Shrestha, DVM", qualification: "DVM, Nepal Agriculture & Forestry University", nvcNumber: "NVC-0876", online: false, verified: true, consults: 1, completed: 0, feeRs: 800 },
  { id: "DR-1213", name: "Dr. Anjali Gurung, BVSc & AH", qualification: "BVSc & AH, Tribhuvan University", nvcNumber: "NVC-1213", online: true, verified: false, consults: 0, completed: 0, feeRs: 750 },
];

function seedAvailability(): AvailabilityMap {
  const days = next14Days();
  const map: AvailabilityMap = {};
  // A realistic starting spread: the offline doctor keeps a few advance slots open,
  // the two online doctors have some daytime slots open on the next few days too.
  const pattern: Record<string, number[]> = {
    "DR-1042": [2, 3, 5],
    "DR-0876": [1, 2, 3, 4, 6],
    "DR-1213": [2, 4],
  };
  for (const [doctorId, dayIndices] of Object.entries(pattern)) {
    map[doctorId] = {};
    for (const i of dayIndices) {
      map[doctorId][days[i]] = [AVAILABILITY_SLOTS[0], AVAILABILITY_SLOTS[2]];
    }
  }
  return map;
}

export const availabilitySeed: AvailabilityMap = seedAvailability();

export const vetBookingSeed: VetBooking[] = [
  {
    id: "VET-1001", ownerId: "", ownerName: "Eva Gurung", ownerPhone: "+977 9841112233", ownerEmail: "eva.gurung@gmail.com",
    petName: "Bruno", petSpecies: "Dog — Labrador", petAge: "2 yrs", reason: "Annual checkup",
    doctorId: "DR-1042", doctorName: "Dr. Sujata Rai, BVSc & AH", instant: true, scheduledDate: "", scheduledTime: "",
    amount: 800, status: "Completed", paymentReceiptUploaded: true, callStartedByDoctor: true,
    chatMessages: [], clientDocuments: [], doctorDocuments: [], doctorNote: "Healthy — recommended routine deworming.", noteHistory: [],
    invoiceNumber: "INV-VET-1001", createdAt: Date.now() - 12 * 86400000,
  },
  {
    id: "VET-1002", ownerId: "", ownerName: "Eva Gurung", ownerPhone: "+977 9841112233", ownerEmail: "eva.gurung@gmail.com",
    petName: "Bruno", petSpecies: "Dog — Labrador", petAge: "2 yrs", reason: "Skin irritation",
    doctorId: "DR-1042", doctorName: "Dr. Sujata Rai, BVSc & AH", instant: true, scheduledDate: "", scheduledTime: "",
    amount: 800, status: "Completed", paymentReceiptUploaded: true, callStartedByDoctor: true,
    chatMessages: [], clientDocuments: [], doctorDocuments: [], doctorNote: "Prescribed antihistamine cream.", noteHistory: [],
    invoiceNumber: "INV-VET-1002", createdAt: Date.now() - 9 * 86400000,
  },
  {
    id: "VET-1003", ownerId: "", ownerName: "Eva Gurung", ownerPhone: "+977 9841112233", ownerEmail: "eva.gurung@gmail.com",
    petName: "Bruno", petSpecies: "Dog — Labrador", petAge: "2 yrs", reason: "Vaccination follow-up",
    doctorId: "DR-1042", doctorName: "Dr. Sujata Rai, BVSc & AH", instant: true, scheduledDate: "", scheduledTime: "",
    amount: 800, status: "Completed", paymentReceiptUploaded: true, callStartedByDoctor: true,
    chatMessages: [], clientDocuments: [], doctorDocuments: [], doctorNote: "DHPPiL booster given.", noteHistory: [],
    invoiceNumber: "INV-VET-1003", createdAt: Date.now() - 6 * 86400000,
  },
  {
    id: "VET-1004", ownerId: "", ownerName: "Eva Gurung", ownerPhone: "+977 9841112233", ownerEmail: "eva.gurung@gmail.com",
    petName: "Milo", petSpecies: "Dog — Labrador Mix", petAge: "3 yrs", reason: "Limping on hind leg",
    doctorId: "DR-0876", doctorName: "Dr. Bikash Shrestha, DVM", instant: false, scheduledDate: "Jul 18, 2026", scheduledTime: "11:30 AM",
    amount: 800, status: "Confirmed", paymentReceiptUploaded: true, callStartedByDoctor: false,
    chatMessages: [], clientDocuments: [], doctorDocuments: [], doctorNote: "", noteHistory: [],
    invoiceNumber: "INV-VET-1004", createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: "VET-1005", ownerId: "", ownerName: "Rojina Shrestha", ownerPhone: "+977 9860011223", ownerEmail: "rojina.s@gmail.com",
    petName: "Coco", petSpecies: "Cat — Persian", petAge: "1 yr", reason: "Not eating well",
    doctorId: "DR-1042", doctorName: "Dr. Sujata Rai, BVSc & AH", instant: true, scheduledDate: "", scheduledTime: "",
    amount: 800, status: "Confirmed", paymentReceiptUploaded: true, callStartedByDoctor: false,
    chatMessages: [], clientDocuments: [], doctorDocuments: [], doctorNote: "", noteHistory: [],
    invoiceNumber: "INV-VET-1005", createdAt: Date.now() - 1 * 86400000,
  },
];
