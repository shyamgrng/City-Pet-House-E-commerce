import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  brands() {
    return this.prisma.brand.findMany({ orderBy: { name: "asc" } });
  }

  testimonials() {
    return this.prisma.testimonial.findMany();
  }

  blogPosts(limit?: number) {
    return this.prisma.blogPost.findMany({
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  }
}
