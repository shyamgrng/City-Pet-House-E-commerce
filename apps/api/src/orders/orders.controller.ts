import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto";
import { OwnerAuthGuard } from "../auth/owner-auth.guard";
import { CurrentUser, CurrentOwner } from "../auth/current-user.decorator";

@UseGuards(OwnerAuthGuard)
@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@CurrentUser() user: CurrentOwner, @Body() dto: CreateOrderDto) {
    return this.orders.create(user.ownerProfileId, dto);
  }

  @Get("mine")
  listMine(@CurrentUser() user: CurrentOwner) {
    return this.orders.listMine(user.ownerProfileId);
  }

  @Get(":id")
  detail(@CurrentUser() user: CurrentOwner, @Param("id") id: string) {
    return this.orders.detail(user.ownerProfileId, id);
  }
}
