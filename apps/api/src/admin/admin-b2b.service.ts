import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateB2BSupplierDto } from "./dto";

@Injectable()
export class AdminB2BService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const users = await this.prisma.user.findMany({
      where: { role: "B2B_SUPPLIER" },
      include: { b2bProfile: true },
      orderBy: { createdAt: "asc" },
    });
    return users.filter((u) => u.b2bProfile).map(this.toDto);
  }

  async update(userId: string, dto: UpdateB2BSupplierDto) {
    const user = await this.getOrThrow(userId);

    if (dto.status) {
      await this.prisma.user.update({ where: { id: userId }, data: { status: dto.status } });
    }
    const { status: _status, ...profileFields } = dto;
    if (Object.keys(profileFields).length > 0) {
      await this.prisma.b2BSupplierProfile.update({ where: { id: user.b2bProfile!.id }, data: profileFields });
    }

    return this.list().then((all) => all.find((s) => s.id === userId));
  }

  private async getOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { b2bProfile: true } });
    if (!user || user.role !== "B2B_SUPPLIER" || !user.b2bProfile) {
      throw new NotFoundException("Supplier account not found.");
    }
    return user;
  }

  private toDto(user: {
    id: string;
    email: string;
    status: string;
    b2bProfile: {
      companyName: string;
      contactName: string;
      phone: string | null;
      altPhone: string | null;
      address: string | null;
      categories: string[];
      commissionPct: number;
      verified: boolean;
    } | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      companyName: user.b2bProfile!.companyName,
      contactName: user.b2bProfile!.contactName,
      phone: user.b2bProfile!.phone,
      altPhone: user.b2bProfile!.altPhone,
      address: user.b2bProfile!.address,
      categories: user.b2bProfile!.categories,
      commissionPct: user.b2bProfile!.commissionPct,
      verified: user.b2bProfile!.verified,
    };
  }
}
