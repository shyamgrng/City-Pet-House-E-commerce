import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAdoptionPostDto } from "./dto";

const POST_LIFETIME_DAYS = 15;

@Injectable()
export class AdoptionService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const cutoff = new Date(Date.now() - POST_LIFETIME_DAYS * 24 * 60 * 60 * 1000);
    return this.prisma.adoptionPost.findMany({
      where: { status: "ACTIVE", createdAt: { gte: cutoff } },
      orderBy: { createdAt: "desc" },
    });
  }

  async mine(ownerProfileId: string) {
    return this.prisma.adoptionPost.findMany({
      where: { postedById: ownerProfileId },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateOwnStatus(ownerProfileId: string, id: string, status: "ACTIVE" | "ADOPTED" | "REMOVED") {
    const post = await this.prisma.adoptionPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException("Adoption post not found.");
    if (post.postedById !== ownerProfileId) throw new ForbiddenException("This isn't your adoption post.");
    await this.prisma.adoptionPost.update({ where: { id }, data: { status } });
    return this.mine(ownerProfileId).then((all) => all.find((p) => p.id === id));
  }

  async detail(id: string) {
    const post = await this.prisma.adoptionPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException("Adoption post not found.");
    return post;
  }

  async create(ownerProfileId: string, dto: CreateAdoptionPostDto) {
    return this.prisma.adoptionPost.create({
      data: { ...dto, postedById: ownerProfileId },
    });
  }
}
