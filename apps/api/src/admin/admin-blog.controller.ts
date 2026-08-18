import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminBlogService } from "./admin-blog.service";
import { UpsertBlogPostDto } from "./dto";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { CurrentAdmin, requirePermission } from "../auth/current-admin.decorator";

@UseGuards(AdminAuthGuard)
@Controller("admin/blog-posts")
export class AdminBlogController {
  constructor(private readonly blog: AdminBlogService) {}

  @Get()
  list(@CurrentAdmin() admin: CurrentAdmin) {
    requirePermission(admin, "dashboard");
    return this.blog.list();
  }

  @Post()
  create(@CurrentAdmin() admin: CurrentAdmin, @Body() dto: UpsertBlogPostDto) {
    requirePermission(admin, "dashboard");
    return this.blog.create(dto);
  }

  @Patch(":id")
  update(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string, @Body() dto: Partial<UpsertBlogPostDto>) {
    requirePermission(admin, "dashboard");
    return this.blog.update(id, dto);
  }

  @Delete(":id")
  remove(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string) {
    requirePermission(admin, "dashboard");
    return this.blog.remove(id);
  }
}
