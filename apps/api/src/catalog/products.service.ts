import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface ProductQuery {
  category?: string;
  brand?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ProductQuery) {
    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
      ...(query.category && query.category !== "All" ? { category: query.category } : {}),
      ...(query.brand && query.brand !== "All" ? { brand: query.brand } : {}),
      ...(query.minRating ? { rating: { gte: query.minRating } } : {}),
      ...(query.minPrice != null || query.maxPrice != null
        ? {
            price: {
              ...(query.minPrice != null ? { gte: query.minPrice } : {}),
              ...(query.maxPrice != null ? { lt: query.maxPrice } : {}),
            },
          }
        : {}),
      ...(query.search?.trim()
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { category: { contains: query.search, mode: "insensitive" } },
              { brand: { contains: query.search, mode: "insensitive" } },
              { tags: { has: query.search } },
            ],
          }
        : {}),
    };

    return this.prisma.product.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  async detail(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found.");
    return product;
  }

  async similar(id: string) {
    const product = await this.detail(id);
    return this.prisma.product.findMany({
      where: { category: product.category, id: { not: id }, status: "ACTIVE" },
      take: 8,
    });
  }

  async todaysDeals() {
    return this.prisma.product.findMany({ where: { todaysDeal: true, status: "ACTIVE" }, take: 12 });
  }

  async byCategoryPlacement(placement: string) {
    return this.prisma.product.findMany({
      where: { homeCategoryPlacement: placement, status: "ACTIVE" },
      take: 12,
    });
  }
}
