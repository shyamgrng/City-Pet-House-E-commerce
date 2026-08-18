import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { B2BService } from "./b2b.service";
import { SendRefundDto } from "./dto";
import { B2BAuthGuard } from "../auth/b2b-auth.guard";
import { CurrentB2B } from "../auth/current-b2b.decorator";

@UseGuards(B2BAuthGuard)
@Controller("b2b")
export class B2BController {
  constructor(private readonly b2b: B2BService) {}

  @Get("me")
  me(@CurrentB2B() supplier: CurrentB2B) {
    return this.b2b.me(supplier.b2bProfileId);
  }

  @Get("incoming-orders")
  incomingOrders(@CurrentB2B() supplier: CurrentB2B) {
    return this.b2b.incomingOrders(supplier.b2bProfileId);
  }

  @Post("order-items/:id/out-of-stock")
  markOutOfStock(@CurrentB2B() supplier: CurrentB2B, @Param("id") id: string) {
    return this.b2b.markOutOfStock(supplier.b2bProfileId, id);
  }

  @Post("order-items/:id/send-refund")
  sendRefund(@CurrentB2B() supplier: CurrentB2B, @Param("id") id: string, @Body() dto: SendRefundDto) {
    return this.b2b.sendRefund(supplier.b2bProfileId, id, dto.reason);
  }

  @Post("order-items/:id/mark-sent")
  markSent(@CurrentB2B() supplier: CurrentB2B, @Param("id") id: string) {
    return this.b2b.markSent(supplier.b2bProfileId, id);
  }

  @Get("finance")
  finance(@CurrentB2B() supplier: CurrentB2B) {
    return this.b2b.finance(supplier.b2bProfileId);
  }
}
