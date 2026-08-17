import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminAdoptionService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.adoptionPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        postedBy: { select: { name: true, user: { select: { email: true, phone: true } } } },
      },
    });
  }

  async setStatus(id: string, status: string) {
    const post = await this.prisma.adoptionPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException("Adoption post not found.");
    return this.prisma.adoptionPost.update({ where: { id }, data: { status } });
  }
}
