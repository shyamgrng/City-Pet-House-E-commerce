import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdminCartsService } from "./admin-carts.service";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { CurrentAdmin, requirePermission } from "../auth/current-admin.decorator";

@UseGuards(AdminAuthGuard)
@Controller("admin/carts")
export class AdminCartsController {
  constructor(private readonly carts: AdminCartsService) {}

  @Get()
  list(@CurrentAdmin() admin: CurrentAdmin) {
    requirePermission(admin, "shop");
    return this.carts.list();
  }
}
