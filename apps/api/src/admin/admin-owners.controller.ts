import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { AdminOwnersService } from "./admin-owners.service";
import { UpdatePetOwnerStatusDto } from "./dto";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { CurrentAdmin, requirePermission } from "../auth/current-admin.decorator";

@UseGuards(AdminAuthGuard)
@Controller("admin/pet-owners")
export class AdminOwnersController {
  constructor(private readonly owners: AdminOwnersService) {}

  @Get()
  list(@CurrentAdmin() admin: CurrentAdmin) {
    requirePermission(admin, "users");
    return this.owners.list();
  }

  @Patch(":id")
  updateStatus(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string, @Body() dto: UpdatePetOwnerStatusDto) {
    requirePermission(admin, "users");
    return this.owners.updateStatus(id, dto.status);
  }
}
