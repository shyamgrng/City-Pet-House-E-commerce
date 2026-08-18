import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateCourierDto } from "./dto";

@Injectable()
export class AdminCouriersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const users = await this.prisma.user.findMany({
      where: { role: "COURIER" },
      include: { courierProfile: true },
      orderBy: { createdAt: "asc" },
    });
    return users.filter((u) => u.courierProfile).map(this.toDto);
  }

  async update(userId: string, dto: UpdateCourierDto) {
    const user = await this.getOrThrow(userId);

    if (dto.status) {
      await this.prisma.user.update({ where: { id: userId }, data: { status: dto.status } });
    }
    const { status: _status, ...profileFields } = dto;
    if (Object.keys(profileFields).length > 0) {
      await this.prisma.courierProfile.update({ where: { id: user.courierProfile!.id }, data: profileFields });
    }

    return this.list().then((all) => all.find((c) => c.id === userId));
  }

  private async getOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { courierProfile: true } });
    if (!user || user.role !== "COURIER" || !user.courierProfile) {
      throw new NotFoundException("Courier account not found.");
    }
    return user;
  }

  private toDto(user: {
    id: string;
    email: string;
    status: string;
    courierProfile: {
      id: string;
      companyName: string;
      contactName: string;
      phone: string | null;
      altPhone: string | null;
      address: string | null;
      verified: boolean;
    } | null;
  }) {
    return {
      id: user.id,
      // The CourierProfile id — this is what CourierAssignment.courierId and
      // the admin order assign-courier endpoint actually reference, not the
      // User id above (which is only for account management by this same
      // controller's PATCH route).
      courierProfileId: user.courierProfile!.id,
      email: user.email,
      status: user.status,
      companyName: user.courierProfile!.companyName,
      contactName: user.courierProfile!.contactName,
      phone: user.courierProfile!.phone,
      altPhone: user.courierProfile!.altPhone,
      address: user.courierProfile!.address,
      verified: user.courierProfile!.verified,
    };
  }
}
