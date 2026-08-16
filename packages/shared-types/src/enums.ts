export const UserRole = {
  PET_OWNER: "PET_OWNER",
  DOCTOR: "DOCTOR",
  B2B_SUPPLIER: "B2B_SUPPLIER",
  COURIER: "COURIER",
  ADMIN_STAFF: "ADMIN_STAFF",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const OrderStage = {
  PAYMENT_QUEUE: "PAYMENT_QUEUE",
  CONFIRMED: "CONFIRMED",
  DISPATCH: "DISPATCH",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;
export type OrderStage = (typeof OrderStage)[keyof typeof OrderStage];

export const PaymentStatus = {
  PENDING_REVIEW: "PENDING_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PetSpecies = {
  DOG: "Dog",
  CAT: "Cat",
  SMALL_PETS: "Small Pets",
  BIRDS: "Birds",
  FISH: "Fish",
} as const;
export type PetSpecies = (typeof PetSpecies)[keyof typeof PetSpecies];
