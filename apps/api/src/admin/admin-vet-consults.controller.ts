import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { VetBookingStatus } from "@prisma/client";
import { AdminVetConsultsService } from "./admin-vet-consults.service";
import { SetWebVetActiveDto } from "./dto";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { CurrentAdmin, requirePermission } from "../auth/current-admin.decorator";

@UseGuards(AdminAuthGuard)
@Controller("admin/vet-consults")
export class AdminVetConsultsController {
  constructor(private readonly vetConsults: AdminVetConsultsService) {}

  @Get()
  list(@CurrentAdmin() admin: CurrentAdmin, @Query("status") status?: VetBookingStatus) {
    requirePermission(admin, "vetconsults");
    return this.vetConsults.list(status);
  }

  @Get("settings")
  getSettings(@CurrentAdmin() admin: CurrentAdmin) {
    requirePermission(admin, "vetconsults");
    return this.vetConsults.getSettings();
  }

  @Patch("settings")
  setActive(@CurrentAdmin() admin: CurrentAdmin, @Body() dto: SetWebVetActiveDto) {
    requirePermission(admin, "vetconsults");
    return this.vetConsults.setActive(dto.active);
  }

  @Post(":id/approve-payment")
  approvePayment(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string) {
    requirePermission(admin, "vetconsults");
    return this.vetConsults.approvePayment(id);
  }

  @Post(":id/reject-payment")
  rejectPayment(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string) {
    requirePermission(admin, "vetconsults");
    return this.vetConsults.rejectPayment(id);
  }

  @Post(":id/confirm")
  confirm(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string) {
    requirePermission(admin, "vetconsults");
    return this.vetConsults.confirm(id);
  }

  @Post(":id/complete")
  complete(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string) {
    requirePermission(admin, "vetconsults");
    return this.vetConsults.complete(id);
  }

  @Post(":id/cancel")
  cancel(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string) {
    requirePermission(admin, "vetconsults");
    return this.vetConsults.cancel(id);
  }
}
