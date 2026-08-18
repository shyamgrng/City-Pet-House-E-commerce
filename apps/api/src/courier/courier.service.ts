import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const ASSIGNMENT_INCLUDE = {
  order: {
    select: {
      id: true,
      stage: true,
      addressSnapshot: true,
      amount: true,
      deliveryFee: true,
      paymentMethod: true,
      buyer: { select: { name: true } },
      items: { select: { nameSnapshot: true, qty: true } },
    },
  },
};

@Injectable()
export class CourierService {
  constructor(private readonly prisma: PrismaService) {}

  async me(courierProfileId: string) {
    const profile = await this.prisma.courierProfile.findUnique({
      where: { id: courierProfileId },
      include: { user: { select: { email: true, status: true } } },
    });
    if (!profile) throw new NotFoundException("Courier profile not found.");
    return {
      id: profile.id,
      companyName: profile.companyName,
      contactName: profile.contactName,
      email: profile.user.email,
      phone: profile.phone,
      altPhone: profile.altPhone,
      address: profile.address,
      verified: profile.verified,
      status: profile.user.status,
    };
  }

  async assignments(courierProfileId: string) {
    return this.prisma.courierAssignment.findMany({
      where: { courierId: courierProfileId },
      include: ASSIGNMENT_INCLUDE,
      orderBy: { assignedAt: "desc" },
    });
  }

  private async getOwnAssignmentOrThrow(courierProfileId: string, id: string) {
    const assignment = await this.prisma.courierAssignment.findUnique({ where: { id }, include: ASSIGNMENT_INCLUDE });
    if (!assignment) throw new NotFoundException("Assignment not found.");
    if (assignment.courierId !== courierProfileId) throw new ForbiddenException("This assignment isn't yours.");
    return assignment;
  }

  async receive(courierProfileId: string, id: string) {
    const assignment = await this.getOwnAssignmentOrThrow(courierProfileId, id);
    if (assignment.cancelledAt) throw new BadRequestException("This assignment was cancelled.");
    if (assignment.receivedAt) throw new BadRequestException("This assignment has already been received.");
    if (assignment.order.stage !== "DISPATCH") {
      throw new BadRequestException("This order isn't ready for pickup yet.");
    }

    await this.prisma.courierAssignment.update({ where: { id }, data: { receivedAt: new Date() } });
    await this.prisma.order.update({
      where: { id: assignment.order.id },
      data: {
        stage: "OUT_FOR_DELIVERY",
        statusHistory: { create: { stage: "OUT_FOR_DELIVERY", actor: "courier", note: "Picked up by courier" } },
      },
    });
    return this.getOwnAssignmentOrThrow(courierProfileId, id);
  }

  async deliver(courierProfileId: string, id: string) {
    const assignment = await this.getOwnAssignmentOrThrow(courierProfileId, id);
    if (assignment.cancelledAt) throw new BadRequestException("This assignment was cancelled.");
    if (!assignment.receivedAt) throw new BadRequestException("Mark this as received before marking it delivered.");
    if (assignment.deliveredAt) throw new BadRequestException("This assignment has already been delivered.");

    await this.prisma.courierAssignment.update({ where: { id }, data: { deliveredAt: new Date() } });
    await this.prisma.order.update({
      where: { id: assignment.order.id },
      data: {
        stage: "DELIVERED",
        statusHistory: { create: { stage: "DELIVERED", actor: "courier" } },
      },
    });
    return this.getOwnAssignmentOrThrow(courierProfileId, id);
  }

  async cancel(courierProfileId: string, id: string, reason: string) {
    const assignment = await this.getOwnAssignmentOrThrow(courierProfileId, id);
    if (assignment.deliveredAt) throw new BadRequestException("This assignment has already been delivered.");
    if (assignment.cancelledAt) throw new BadRequestException("This assignment was already cancelled.");

    await this.prisma.courierAssignment.update({
      where: { id },
      data: { cancelledAt: new Date(), cancellationReason: reason },
    });
    // Revert to DISPATCH (unassigned) so admin can hand it to another courier —
    // never leave an order silently stuck OUT_FOR_DELIVERY with no one carrying it.
    await this.prisma.order.update({
      where: { id: assignment.order.id },
      data: {
        courierId: null,
        stage: "DISPATCH",
        statusHistory: { create: { stage: "DISPATCH", actor: "courier", note: `Courier cancelled: ${reason}` } },
      },
    });
    return this.getOwnAssignmentOrThrow(courierProfileId, id);
  }
}
