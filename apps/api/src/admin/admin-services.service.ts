import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertServiceDto } from "./dto";

@Injectable()
export class AdminServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.service.findMany({ orderBy: { order: "asc" } });
  }

  async create(dto: UpsertServiceDto) {
    return this.prisma.service.create({
      data: { ...dto, benefits: dto.benefits ?? [] },
    });
  }

  async update(id: string, dto: Partial<UpsertServiceDto>) {
    await this.getOrThrow(id);
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.getOrThrow(id);
    await this.prisma.service.delete({ where: { id } });
    return { ok: true };
  }

  private async getOrThrow(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException("Service not found.");
    return service;
  }
}
