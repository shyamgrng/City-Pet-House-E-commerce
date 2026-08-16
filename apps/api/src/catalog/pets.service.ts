import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PetsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(species?: string) {
    return this.prisma.petListing.findMany({
      where: {
        status: "AVAILABLE",
        ...(species && species !== "All" ? { species } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async detail(id: string) {
    const pet = await this.prisma.petListing.findUnique({ where: { id } });
    if (!pet) throw new NotFoundException("Pet listing not found.");
    return pet;
  }

  async similar(id: string) {
    const pet = await this.detail(id);
    return this.prisma.petListing.findMany({
      where: { species: pet.species, id: { not: id }, status: "AVAILABLE" },
      take: 4,
    });
  }
}
