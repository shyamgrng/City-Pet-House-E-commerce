import { Injectable, NotFoundException } from "@nestjs/common";
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
      where: { status: "ACTIVE" },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  }

  async blogPost(slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post || post.status !== "ACTIVE") throw new NotFoundException("Blog post not found.");
    return post;
  }

  services() {
    return this.prisma.service.findMany({ where: { status: "ACTIVE" }, orderBy: { order: "asc" } });
  }

  async service(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service || service.status !== "ACTIVE") throw new NotFoundException("Service not found.");
    return service;
  }
}
