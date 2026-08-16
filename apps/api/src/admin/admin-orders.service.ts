import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OrderStage, PaymentStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const ORDER_INCLUDE = {
  items: true,
  checklist: true,
  statusHistory: { orderBy: { at: "asc" as const } },
  buyer: { select: { name: true } },
};

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Admin sees everything — no owner scoping, unlike the pet-owner-facing OrdersService. */
  async list(params: { stage?: OrderStage; paymentStatus?: PaymentStatus }) {
    return this.prisma.order.findMany({
      where: {
        ...(params.stage ? { stage: params.stage } : {}),
        ...(params.paymentStatus ? { paymentStatus: params.paymentStatus } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: ORDER_INCLUDE,
    });
  }

  private async getOrThrow(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });
    if (!order) throw new NotFoundException("Order not found.");
    return order;
  }

  async approvePayment(orderId: string, adminName: string) {
    const order = await this.getOrThrow(orderId);
    if (order.paymentStatus !== "PENDING_REVIEW") {
      throw new BadRequestException("This payment isn't pending review.");
    }
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "APPROVED",
        stage: "CONFIRMED",
        statusHistory: { create: { stage: "CONFIRMED", actor: adminName } },
      },
    });
    return this.getOrThrow(orderId);
  }

  async rejectPayment(orderId: string, reason: string, adminName: string) {
    const order = await this.getOrThrow(orderId);
    if (order.paymentStatus !== "PENDING_REVIEW") {
      throw new BadRequestException("This payment isn't pending review.");
    }
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "REJECTED",
        statusHistory: { create: { stage: "PAYMENT_REJECTED", actor: adminName, note: reason } },
      },
    });
    return this.getOrThrow(orderId);
  }

  async toggleChecklistItem(orderId: string, itemId: string, checked: boolean, adminName: string) {
    const item = await this.prisma.orderChecklistItem.findUnique({ where: { id: itemId } });
    if (!item || item.orderId !== orderId) throw new NotFoundException("Checklist item not found.");
    await this.prisma.orderChecklistItem.update({
      where: { id: itemId },
      data: { checked, checkedAt: checked ? new Date() : null, checkedBy: checked ? adminName : null },
    });
    return this.getOrThrow(orderId);
  }

  async dispatch(orderId: string, adminName: string) {
    const order = await this.getOrThrow(orderId);
    if (order.stage !== "CONFIRMED") {
      throw new BadRequestException("Order must be confirmed before dispatch.");
    }
    if (order.checklist.some((c) => !c.checked)) {
      throw new BadRequestException("Complete the checklist before dispatching.");
    }
    await this.prisma.order.update({
      where: { id: orderId },
      data: { stage: "DISPATCH", statusHistory: { create: { stage: "DISPATCH", actor: adminName } } },
    });
    return this.getOrThrow(orderId);
  }

  async markOutForDelivery(orderId: string, adminName: string) {
    const order = await this.getOrThrow(orderId);
    if (order.stage !== "DISPATCH") {
      throw new BadRequestException("Order must be dispatched first.");
    }
    await this.prisma.order.update({
      where: { id: orderId },
      data: { stage: "OUT_FOR_DELIVERY", statusHistory: { create: { stage: "OUT_FOR_DELIVERY", actor: adminName } } },
    });
    return this.getOrThrow(orderId);
  }

  async markDelivered(orderId: string, adminName: string) {
    const order = await this.getOrThrow(orderId);
    if (order.stage !== "OUT_FOR_DELIVERY") {
      throw new BadRequestException("Order must be out for delivery first.");
    }
    await this.prisma.order.update({
      where: { id: orderId },
      data: { stage: "DELIVERED", statusHistory: { create: { stage: "DELIVERED", actor: adminName } } },
    });
    return this.getOrThrow(orderId);
  }

  async cancel(orderId: string, reason: string, adminName: string) {
    const order = await this.getOrThrow(orderId);
    if (order.stage === "DELIVERED" || order.stage === "CANCELLED") {
      throw new BadRequestException(`Order is already ${order.stage.toLowerCase()}.`);
    }
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        stage: "CANCELLED",
        cancellationReason: reason,
        statusHistory: { create: { stage: "CANCELLED", actor: adminName, note: reason } },
      },
    });
    return this.getOrThrow(orderId);
  }
}
