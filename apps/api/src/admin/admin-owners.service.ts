import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminOwnersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const users = await this.prisma.user.findMany({
      where: { role: "PET_OWNER" },
      include: { petOwnerProfile: { include: { _count: { select: { orders: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return users.filter((u) => u.petOwnerProfile).map(this.toDto);
  }

  async updateStatus(userId: string, status: "ACTIVE" | "SUSPENDED") {
    await this.getOrThrow(userId);
    await this.prisma.user.update({ where: { id: userId }, data: { status } });
    return this.list().then((all) => all.find((o) => o.id === userId));
  }

  private async getOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { petOwnerProfile: true } });
    if (!user || user.role !== "PET_OWNER" || !user.petOwnerProfile) {
      throw new NotFoundException("Pet owner account not found.");
    }
    return user;
  }

  private toDto(user: {
    id: string;
    email: string;
    phone: string | null;
    status: string;
    createdAt: Date;
    petOwnerProfile: { name: string; _count: { orders: number } } | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      status: user.status,
      createdAt: user.createdAt,
      name: user.petOwnerProfile!.name,
      orderCount: user.petOwnerProfile!._count.orders,
    };
  }
}
