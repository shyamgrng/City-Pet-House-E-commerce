import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { OrderStage, PaymentStatus } from "@prisma/client";
import { AdminOrdersService } from "./admin-orders.service";
import { RejectPaymentDto, CancelOrderDto, ToggleChecklistDto } from "./dto";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { CurrentAdmin, requirePermission } from "../auth/current-admin.decorator";

@UseGuards(AdminAuthGuard)
@Controller("admin/orders")
export class AdminOrdersController {
  constructor(private readonly orders: AdminOrdersService) {}

  @Get()
  list(
    @CurrentAdmin() admin: CurrentAdmin,
    @Query("stage") stage?: OrderStage,
    @Query("paymentStatus") paymentStatus?: PaymentStatus,
  ) {
    requirePermission(admin, "deliveries");
    return this.orders.list({ stage, paymentStatus });
  }

  @Post(":id/approve-payment")
  approvePayment(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string) {
    requirePermission(admin, "deliveries");
    return this.orders.approvePayment(id, admin.staffRole);
  }

  @Post(":id/reject-payment")
  rejectPayment(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string, @Body() dto: RejectPaymentDto) {
    requirePermission(admin, "deliveries");
    return this.orders.rejectPayment(id, dto.reason, admin.staffRole);
  }

  @Patch(":id/checklist/:itemId")
  toggleChecklist(
    @CurrentAdmin() admin: CurrentAdmin,
    @Param("id") id: string,
    @Param("itemId") itemId: string,
    @Body() dto: ToggleChecklistDto,
  ) {
    requirePermission(admin, "deliveries");
    return this.orders.toggleChecklistItem(id, itemId, dto.checked, admin.staffRole);
  }

  @Post(":id/dispatch")
  dispatch(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string) {
    requirePermission(admin, "deliveries");
    return this.orders.dispatch(id, admin.staffRole);
  }

  @Post(":id/mark-out-for-delivery")
  markOutForDelivery(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string) {
    requirePermission(admin, "deliveries");
    return this.orders.markOutForDelivery(id, admin.staffRole);
  }

  @Post(":id/mark-delivered")
  markDelivered(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string) {
    requirePermission(admin, "deliveries");
    return this.orders.markDelivered(id, admin.staffRole);
  }

  @Post(":id/cancel")
  cancel(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string, @Body() dto: CancelOrderDto) {
    requirePermission(admin, "deliveries");
    return this.orders.cancel(id, dto.reason, admin.staffRole);
  }
}
