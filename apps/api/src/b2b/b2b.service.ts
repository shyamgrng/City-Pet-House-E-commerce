import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const INCOMING_ORDER_ITEM_INCLUDE = {
  product: { select: { name: true, images: true } },
  order: {
    select: {
      id: true,
      stage: true,
      paymentStatus: true,
      createdAt: true,
      addressSnapshot: true,
      checklist: true,
      buyer: { select: { name: true } },
    },
  },
};

@Injectable()
export class B2BService {
  constructor(private readonly prisma: PrismaService) {}

  async me(b2bProfileId: string) {
    const profile = await this.prisma.b2BSupplierProfile.findUnique({
      where: { id: b2bProfileId },
      include: { user: { select: { email: true, status: true } } },
    });
    if (!profile) throw new NotFoundException("Supplier profile not found.");
    return {
      id: profile.id,
      companyName: profile.companyName,
      contactName: profile.contactName,
      email: profile.user.email,
      phone: profile.phone,
      altPhone: profile.altPhone,
      address: profile.address,
      categories: profile.categories,
      commissionPct: profile.commissionPct,
      verified: profile.verified,
      status: profile.user.status,
    };
  }

  async incomingOrders(b2bProfileId: string) {
    return this.prisma.orderItem.findMany({
      where: { supplierId: b2bProfileId },
      include: INCOMING_ORDER_ITEM_INCLUDE,
      orderBy: { id: "desc" },
    });
  }

  private async getOwnItemOrThrow(b2bProfileId: string, itemId: string) {
    const item = await this.prisma.orderItem.findUnique({ where: { id: itemId }, include: INCOMING_ORDER_ITEM_INCLUDE });
    if (!item) throw new NotFoundException("Order item not found.");
    if (item.supplierId !== b2bProfileId) throw new ForbiddenException("This order item isn't yours.");
    return item;
  }

  async markOutOfStock(b2bProfileId: string, itemId: string) {
    await this.getOwnItemOrThrow(b2bProfileId, itemId);
    await this.prisma.orderItem.update({ where: { id: itemId }, data: { outOfStock: true } });
    return this.getOwnItemOrThrow(b2bProfileId, itemId);
  }

  async sendRefund(b2bProfileId: string, itemId: string, reason: string) {
    const item = await this.getOwnItemOrThrow(b2bProfileId, itemId);
    if (!item.outOfStock) {
      throw new BadRequestException("Only out-of-stock items can be sent for refund.");
    }
    if (item.refundRequested) {
      throw new BadRequestException("A refund has already been requested for this item.");
    }
    await this.prisma.refund.create({
      data: {
        orderItemId: itemId,
        requestedBy: b2bProfileId,
        reason,
        amount: item.priceSnapshot * item.qty,
      },
    });
    await this.prisma.orderItem.update({ where: { id: itemId }, data: { refundRequested: true } });
    return this.getOwnItemOrThrow(b2bProfileId, itemId);
  }

  /** Only enabled once every checklist item on the parent order is checked — enforced here, not just in the UI. */
  async markSent(b2bProfileId: string, itemId: string) {
    const item = await this.getOwnItemOrThrow(b2bProfileId, itemId);
    if (item.sentToCph) {
      throw new BadRequestException("This item has already been marked as sent.");
    }
    if (item.order.checklist.length === 0 || item.order.checklist.some((c) => !c.checked)) {
      throw new BadRequestException("The order's fulfillment checklist must be fully checked before you can mark this as sent.");
    }
    await this.prisma.orderItem.update({ where: { id: itemId }, data: { sentToCph: true } });
    return this.getOwnItemOrThrow(b2bProfileId, itemId);
  }

  async finance(b2bProfileId: string) {
    return this.prisma.b2BFinanceLedgerEntry.findMany({
      where: { supplierId: b2bProfileId },
      orderBy: { createdAt: "desc" },
    });
  }
}
