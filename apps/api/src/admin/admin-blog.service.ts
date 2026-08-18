import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertBlogPostDto } from "./dto";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

@Injectable()
export class AdminBlogService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
  }

  async create(dto: UpsertBlogPostDto) {
    const baseSlug = dto.slug?.trim() || slugify(dto.title);
    const slug = await this.uniqueSlug(baseSlug);
    return this.prisma.blogPost.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: Partial<UpsertBlogPostDto>) {
    await this.getOrThrow(id);
    const data = { ...dto } as Partial<UpsertBlogPostDto> & { slug?: string };
    if (dto.slug) {
      data.slug = await this.uniqueSlug(slugify(dto.slug), id);
    }
    return this.prisma.blogPost.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.getOrThrow(id);
    await this.prisma.blogPost.delete({ where: { id } });
    return { ok: true };
  }

  private async getOrThrow(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException("Blog post not found.");
    return post;
  }

  private async uniqueSlug(base: string, excludeId?: string) {
    let candidate = base || "post";
    let n = 1;
    for (;;) {
      const existing = await this.prisma.blogPost.findUnique({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) return candidate;
      n += 1;
      candidate = `${base}-${n}`;
    }
  }
}
