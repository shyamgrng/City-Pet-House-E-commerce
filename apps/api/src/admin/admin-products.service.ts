import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertProductDto } from "./dto";

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  }

  async create(dto: UpsertProductDto) {
    return this.prisma.product.create({
      data: { ...dto, images: dto.images ?? [], tags: dto.tags ?? [], qty: dto.qty ?? 0 },
    });
  }

  async update(id: string, dto: Partial<UpsertProductDto>) {
    await this.getOrThrow(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.getOrThrow(id);
    await this.prisma.product.delete({ where: { id } });
    return { ok: true };
  }

  async toggleOutOfStock(id: string, outOfStock: boolean) {
    await this.getOrThrow(id);
    return this.prisma.product.update({ where: { id }, data: { outOfStock } });
  }

  private async getOrThrow(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found.");
    return product;
  }
}
