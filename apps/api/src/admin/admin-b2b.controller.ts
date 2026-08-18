import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { AdminB2BService } from "./admin-b2b.service";
import { UpdateB2BSupplierDto } from "./dto";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { CurrentAdmin, requirePermission } from "../auth/current-admin.decorator";

@UseGuards(AdminAuthGuard)
@Controller("admin/b2b-suppliers")
export class AdminB2BController {
  constructor(private readonly suppliers: AdminB2BService) {}

  @Get()
  list(@CurrentAdmin() admin: CurrentAdmin) {
    requirePermission(admin, "dashboard");
    return this.suppliers.list();
  }

  @Patch(":id")
  update(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string, @Body() dto: UpdateB2BSupplierDto) {
    requirePermission(admin, "dashboard");
    return this.suppliers.update(id, dto);
  }
}
