import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto";

const DEFAULT_CHECKLIST = ["Items picked from shelf", "Packed & labeled", "Invoice printed"];

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerProfileId: string, dto: CreateOrderDto) {
    const [address, cart] = await Promise.all([
      this.prisma.address.findUnique({ where: { id: dto.addressId } }),
      this.prisma.cart.findUnique({
        where: { ownerId: ownerProfileId },
        include: { items: { include: { product: true } } },
      }),
    ]);

    if (!address || address.ownerId !== ownerProfileId) {
      throw new NotFoundException("Address not found.");
    }
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException("Your cart is empty.");
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    const deliveryFee = 100; // cart is non-empty here; 0-when-empty is enforced in CartService

    return this.prisma.$transaction(async (tx) => {
      const seq = await tx.orderIdSequence.update({
        where: { id: 1 },
        data: { nextVal: { increment: 1 } },
      });
      const orderId = `ORD-${seq.nextVal}`;

      const order = await tx.order.create({
        data: {
          id: orderId,
          buyerId: ownerProfileId,
          addressSnapshot: {
            label: address.label,
            address: address.address,
            phone: address.phone,
            altPhone: address.altPhone,
          },
          amount: subtotal,
          deliveryFee,
          paymentMethod: dto.paymentMethod,
          paymentReceiptUrl: dto.paymentReceiptUrl,
          paymentStatus: "PENDING_REVIEW",
          stage: "PAYMENT_QUEUE",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              nameSnapshot: item.product.name,
              priceSnapshot: item.product.price,
              qty: item.qty,
              supplierId: item.product.supplierId,
            })),
          },
          checklist: {
            create: DEFAULT_CHECKLIST.map((label) => ({ label })),
          },
          statusHistory: {
            create: { stage: "PAYMENT_QUEUE", actor: "owner" },
          },
        },
        include: { items: true, checklist: true, statusHistory: true },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });
  }

  async listMine(ownerProfileId: string) {
    return this.prisma.order.findMany({
      where: { buyerId: ownerProfileId },
      orderBy: { createdAt: "desc" },
      include: { items: true, statusHistory: { orderBy: { at: "asc" } } },
    });
  }

  async detail(ownerProfileId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, checklist: true, statusHistory: { orderBy: { at: "asc" } } },
    });
    if (!order) throw new NotFoundException("Order not found.");
    if (order.buyerId !== ownerProfileId) throw new ForbiddenException();
    return order;
  }
}
