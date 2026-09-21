export type VetStatus = "Payment Review" | "Awaiting Doctor Reconfirm" | "Confirmed" | "In Progress" | "Completed";

export type VetBooking = {
  doctorId: string;
  doctorName: string;
  instant: boolean;
  scheduledDate: string;
  scheduledTime: string;
  scheduledAt: number | null;
  amount: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  petName: string;
  petSpecies: string;
  petAge: string;
  reason: string;
  receiptUri: string;
  status: VetStatus;
  invoiceNumber: string;
};
