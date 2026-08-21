export type RefundRecord = {
  id: string;
  orderId: string;
  clientName: string;
  amount: number;
  type: string;
  proofPhoto: string;
  approvedBy: string;
  createdAt: number;
};
