import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminServicesService } from "./admin-services.service";
import { UpsertServiceDto } from "./dto";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { CurrentAdmin, requirePermission } from "../auth/current-admin.decorator";

@UseGuards(AdminAuthGuard)
@Controller("admin/services")
export class AdminServicesController {
  constructor(private readonly services: AdminServicesService) {}

  @Get()
  list(@CurrentAdmin() admin: CurrentAdmin) {
    requirePermission(admin, "dashboard");
    return this.services.list();
  }

  @Post()
  create(@CurrentAdmin() admin: CurrentAdmin, @Body() dto: UpsertServiceDto) {
    requirePermission(admin, "dashboard");
    return this.services.create(dto);
  }

  @Patch(":id")
  update(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string, @Body() dto: Partial<UpsertServiceDto>) {
    requirePermission(admin, "dashboard");
    return this.services.update(id, dto);
  }

  @Delete(":id")
  remove(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string) {
    requirePermission(admin, "dashboard");
    return this.services.remove(id);
  }
}
