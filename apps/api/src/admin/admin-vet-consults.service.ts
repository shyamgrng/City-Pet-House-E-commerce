import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { VetBookingStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const BOOKING_INCLUDE = {
  owner: { select: { name: true } },
  doctor: { select: { displayName: true, consultFee: true } },
  pet: { select: { name: true, species: true, breed: true } },
};

@Injectable()
export class AdminVetConsultsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(status?: VetBookingStatus) {
    return this.prisma.vetBooking.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      include: BOOKING_INCLUDE,
    });
  }

  private async getOrThrow(id: string) {
    const booking = await this.prisma.vetBooking.findUnique({ where: { id }, include: BOOKING_INCLUDE });
    if (!booking) throw new NotFoundException("Vet booking not found.");
    return booking;
  }

  async approvePayment(id: string) {
    const booking = await this.getOrThrow(id);
    if (booking.status !== "PENDING_PAYMENT") {
      throw new BadRequestException("This booking isn't awaiting payment review.");
    }
    return this.prisma.$transaction(async (tx) => {
      const seq = await tx.vetBookingIdSequence.update({ where: { id: 1 }, data: { nextVal: { increment: 1 } } });
      await tx.vetBooking.update({
        where: { id },
        data: { status: "PAYMENT_APPROVED", paymentApprovedAt: new Date(), invoiceNumber: `VET-${seq.nextVal}` },
      });
      return tx.vetBooking.findUnique({ where: { id }, include: BOOKING_INCLUDE });
    });
  }

  async rejectPayment(id: string) {
    const booking = await this.getOrThrow(id);
    if (booking.status !== "PENDING_PAYMENT") {
      throw new BadRequestException("This booking isn't awaiting payment review.");
    }
    await this.prisma.vetBooking.update({ where: { id }, data: { paymentReceiptUrl: null } });
    return this.getOrThrow(id);
  }

  async confirm(id: string) {
    const booking = await this.getOrThrow(id);
    if (booking.status !== "PAYMENT_APPROVED") {
      throw new BadRequestException("This booking's payment hasn't been approved yet.");
    }
    await this.prisma.vetBooking.update({
      where: { id },
      data: { status: "CONFIRMED", doctorReconfirmedAt: new Date() },
    });
    return this.getOrThrow(id);
  }

  async complete(id: string) {
    const booking = await this.getOrThrow(id);
    if (booking.status !== "CONFIRMED") {
      throw new BadRequestException("This booking must be confirmed first.");
    }
    await this.prisma.vetBooking.update({
      where: { id },
      data: { status: "COMPLETED", callEndedAt: new Date() },
    });
    return this.getOrThrow(id);
  }

  async cancel(id: string) {
    const booking = await this.getOrThrow(id);
    if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
      throw new BadRequestException(`Booking is already ${booking.status.toLowerCase()}.`);
    }
    await this.prisma.vetBooking.update({ where: { id }, data: { status: "CANCELLED" } });
    return this.getOrThrow(id);
  }

  async getSettings() {
    return this.prisma.webVetSetting.upsert({ where: { id: 1 }, update: {}, create: { id: 1, active: true } });
  }

  async setActive(active: boolean) {
    return this.prisma.webVetSetting.upsert({ where: { id: 1 }, update: { active }, create: { id: 1, active } });
  }
}
