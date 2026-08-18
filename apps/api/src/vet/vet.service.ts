import { randomUUID } from "crypto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVetBookingDto } from "./dto";

const BOOKING_INCLUDE = {
  doctor: { select: { displayName: true, qualification: true, isOnline: true } },
  pet: { select: { name: true, species: true, breed: true } },
};

@Injectable()
export class VetService {
  constructor(private readonly prisma: PrismaService) {}

  async status() {
    const setting = await this.prisma.webVetSetting.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, active: true },
    });
    return { active: setting.active };
  }

  async doctors() {
    return this.prisma.doctorProfile.findMany({
      where: { verified: true },
      select: { id: true, displayName: true, qualification: true, licenseNo: true, consultFee: true, isOnline: true },
      orderBy: { displayName: "asc" },
    });
  }

  async createBooking(ownerProfileId: string, dto: CreateVetBookingDto) {
    const doctor = await this.prisma.doctorProfile.findUnique({ where: { id: dto.doctorId } });
    if (!doctor || !doctor.verified) throw new NotFoundException("Doctor not found.");

    const scheduledAt = new Date(dto.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) throw new BadRequestException("Invalid scheduled time.");

    const pet = await this.prisma.pet.create({
      data: { ownerId: ownerProfileId, name: dto.petName, species: dto.species, breed: dto.breed },
    });

    const reason = dto.age ? `Pet age: ${dto.age}. ${dto.reason}` : dto.reason;

    return this.prisma.vetBooking.create({
      data: {
        ownerId: ownerProfileId,
        petId: pet.id,
        doctorId: doctor.id,
        isOnline: dto.isOnline,
        scheduledAt,
        reason,
        amount: doctor.consultFee,
        paymentReceiptUrl: dto.paymentReceiptUrl,
        status: "PENDING_PAYMENT",
        roomChannel: `vet-${randomUUID()}`,
      },
      include: BOOKING_INCLUDE,
    });
  }

  async listMine(ownerProfileId: string) {
    return this.prisma.vetBooking.findMany({
      where: { ownerId: ownerProfileId },
      orderBy: { createdAt: "desc" },
      include: BOOKING_INCLUDE,
    });
  }
}
