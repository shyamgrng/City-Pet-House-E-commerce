import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertPetListingDto } from "./dto";

@Injectable()
export class AdminPetsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.petListing.findMany({ orderBy: { createdAt: "desc" } });
  }

  async create(dto: UpsertPetListingDto) {
    return this.prisma.petListing.create({
      data: { ...dto, images: dto.images ?? [], videos: dto.videos ?? [], tags: dto.tags ?? [] },
    });
  }

  async update(id: string, dto: Partial<UpsertPetListingDto>) {
    await this.getOrThrow(id);
    return this.prisma.petListing.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.getOrThrow(id);
    await this.prisma.petListing.delete({ where: { id } });
    return { ok: true };
  }

  private async getOrThrow(id: string) {
    const pet = await this.prisma.petListing.findUnique({ where: { id } });
    if (!pet) throw new NotFoundException("Pet listing not found.");
    return pet;
  }
}
