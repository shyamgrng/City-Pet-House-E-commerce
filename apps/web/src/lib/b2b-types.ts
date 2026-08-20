export type SubmissionStatus = "Pending" | "Approved" | "Rejected";

export type B2BProductSubmission = {
  id: string;
  b2bId: string;
  companyName: string;
  name: string;
  desc: string;
  category: string;
  brand: string;
  price: number;
  qty: number;
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
