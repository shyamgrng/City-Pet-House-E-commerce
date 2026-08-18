import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { VetBookingStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const BOOKING_INCLUDE = {
  owner: { select: { name: true } },
  pet: { select: { name: true, species: true, breed: true } },
};

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}

  async me(doctorProfileId: string) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { id: doctorProfileId },
      include: { user: { select: { email: true } } },
    });
    if (!profile) throw new NotFoundException("Doctor profile not found.");
    return {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.user.email,
      qualification: profile.qualification,
      licenseNo: profile.licenseNo,
      consultFee: profile.consultFee,
      isOnline: profile.isOnline,
      verified: profile.verified,
    };
  }

  async setOnline(doctorProfileId: string, online: boolean) {
    await this.prisma.doctorProfile.update({ where: { id: doctorProfileId }, data: { isOnline: online } });
    return this.me(doctorProfileId);
  }

  async bookings(doctorProfileId: string, status?: VetBookingStatus) {
    return this.prisma.vetBooking.findMany({
      where: { doctorId: doctorProfileId, ...(status ? { status } : {}) },
      orderBy: { scheduledAt: "asc" },
      include: BOOKING_INCLUDE,
    });
  }

  private async getOwnBookingOrThrow(doctorProfileId: string, id: string) {
    const booking = await this.prisma.vetBooking.findUnique({ where: { id }, include: BOOKING_INCLUDE });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.doctorId !== doctorProfileId) throw new ForbiddenException("This booking isn't assigned to you.");
    return booking;
  }

  async confirm(doctorProfileId: string, id: string) {
    const booking = await this.getOwnBookingOrThrow(doctorProfileId, id);
    if (booking.status !== "PAYMENT_APPROVED") {
      throw new BadRequestException("This booking's payment hasn't been approved yet.");
    }
    await this.prisma.vetBooking.update({
      where: { id },
      data: { status: "CONFIRMED", doctorReconfirmedAt: new Date() },
    });
    return this.getOwnBookingOrThrow(doctorProfileId, id);
  }

  async complete(doctorProfileId: string, id: string) {
    const booking = await this.getOwnBookingOrThrow(doctorProfileId, id);
    if (booking.status !== "CONFIRMED") {
      throw new BadRequestException("This booking must be confirmed first.");
    }
    await this.prisma.vetBooking.update({
      where: { id },
      data: { status: "COMPLETED", callEndedAt: new Date() },
    });
    return this.getOwnBookingOrThrow(doctorProfileId, id);
  }
}
