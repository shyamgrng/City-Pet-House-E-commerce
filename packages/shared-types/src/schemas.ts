import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  brand: z.string().nullable(),
  price: z.number().int().nonnegative(),
  images: z.array(z.string()),
  tags: z.array(z.string()),
  rating: z.number().min(0).max(5).nullable(),
  outOfStock: z.boolean(),
  supplierId: z.string().nullable(),
  todaysDeal: z.boolean(),
});
export type ProductDto = z.infer<typeof ProductSchema>;

export const PetListingSchema = z.object({
  id: z.string(),
  breed: z.string(),
  species: z.string(),
  sex: z.string(),
  age: z.string(),
  price: z.number().int().nonnegative(),
  deliveryFee: z.number().int().nonnegative(),
  images: z.array(z.string()),
  videos: z.array(z.string()),
  tags: z.array(z.string()),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]),
});
export type PetListingDto = z.infer<typeof PetListingSchema>;

export const CartItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  unitPrice: z.number().int().nonnegative(),
  qty: z.number().int().positive(),
});
export type CartItemDto = z.infer<typeof CartItemSchema>;

export const AddressSchema = z.object({
  id: z.string(),
  label: z.string(),
  address: z.string(),
  phone: z.string(),
  altPhone: z.string().nullable(),
  mapLink: z.string().nullable(),
  isPrimary: z.boolean(),
});
export type AddressDto = z.infer<typeof AddressSchema>;

export const OrderStatusEventSchema = z.object({
  stage: z.string(),
  at: z.string(),
  actor: z.string().nullable(),
});

export const OrderSchema = z.object({
  id: z.string(),
  stage: z.string(),
  paymentStatus: z.string(),
  amount: z.number().int().nonnegative(),
  deliveryFee: z.number().int().nonnegative(),
  paymentReceiptUrl: z.string().nullable(),
  createdAt: z.string(),
  statusHistory: z.array(OrderStatusEventSchema),
  items: z.array(
    z.object({
      id: z.string(),
      productId: z.string().nullable(),
      name: z.string(),
      price: z.number().int().nonnegative(),
      qty: z.number().int().positive(),
      supplierId: z.string().nullable(),
      outOfStock: z.boolean(),
      refundRequested: z.boolean(),
    }),
  ),
});
export type OrderDto = z.infer<typeof OrderSchema>;

export const RegisterPetOwnerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(8),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const CreateOrderSchema = z.object({
  addressId: z.string(),
  paymentMethod: z.enum(["FONEPAY", "BANK_TRANSFER"]),
  paymentReceiptUrl: z.string().min(1),
});
