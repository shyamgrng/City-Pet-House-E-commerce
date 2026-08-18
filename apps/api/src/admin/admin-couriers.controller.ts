import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { AdminCouriersService } from "./admin-couriers.service";
import { UpdateCourierDto } from "./dto";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { CurrentAdmin, requirePermission } from "../auth/current-admin.decorator";

@UseGuards(AdminAuthGuard)
@Controller("admin/couriers")
export class AdminCouriersController {
  constructor(private readonly couriers: AdminCouriersService) {}

  @Get()
  list(@CurrentAdmin() admin: CurrentAdmin) {
    requirePermission(admin, "dashboard");
    return this.couriers.list();
  }

  @Patch(":id")
  update(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string, @Body() dto: UpdateCourierDto) {
    requirePermission(admin, "dashboard");
    return this.couriers.update(id, dto);
  }
}
