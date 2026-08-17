import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { AdminAdoptionService } from "./admin-adoption.service";
import { UpdateAdoptionStatusDto } from "./dto";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { CurrentAdmin, requirePermission } from "../auth/current-admin.decorator";

@UseGuards(AdminAuthGuard)
@Controller("admin/adoption-posts")
export class AdminAdoptionController {
  constructor(private readonly adoption: AdminAdoptionService) {}

  @Get()
  list(@CurrentAdmin() admin: CurrentAdmin) {
    requirePermission(admin, "dashboard");
    return this.adoption.list();
  }

  @Patch(":id/status")
  setStatus(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string, @Body() dto: UpdateAdoptionStatusDto) {
    requirePermission(admin, "dashboard");
    return this.adoption.setStatus(id, dto.status);
  }
}
