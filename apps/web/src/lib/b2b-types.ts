import type { CourierPackageSize } from "./catalog-types";

export type SubmissionStatus = "Pending" | "Approved" | "Rejected";

export type B2BProductSubmission = {
  id: string;
  b2bId: string;
  companyName: string;
  name: string;
  desc: string;
  photos: string[];
  category: string;
  sku: string;
  brand: string;
  price: number;
  qty: number;
  lowStockAlert: number;
  sizes: string[];
  colours: string[];
  courierPackageSize: CourierPackageSize;
  tags: string[];
  newArrival: boolean;
  hotSale: boolean;
  hotDiscount: number;
  todaysDeal: boolean;
  dealStart: string;
  dealEnd: string;
  outOfStock: boolean;
  commissionPct: number;
  status: SubmissionStatus;
  submittedAt: number;
};

export function netPayout(sub: B2BProductSubmission) {
  return Math.round(sub.price * sub.qty * (1 - sub.commissionPct / 100));
}

export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  Pending: "#B8860B",
  Approved: "#1F7A4D",
  Rejected: "#D64545",
};
