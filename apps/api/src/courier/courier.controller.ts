import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CourierService } from "./courier.service";
import { CancelAssignmentDto } from "./dto";
import { CourierAuthGuard } from "../auth/courier-auth.guard";
import { CurrentCourier } from "../auth/current-courier.decorator";

@UseGuards(CourierAuthGuard)
@Controller("courier")
export class CourierController {
  constructor(private readonly courier: CourierService) {}

  @Get("me")
  me(@CurrentCourier() courier: CurrentCourier) {
    return this.courier.me(courier.courierProfileId);
  }

  @Get("assignments")
  assignments(@CurrentCourier() courier: CurrentCourier) {
    return this.courier.assignments(courier.courierProfileId);
  }

  @Post("assignments/:id/receive")
  receive(@CurrentCourier() courier: CurrentCourier, @Param("id") id: string) {
    return this.courier.receive(courier.courierProfileId, id);
  }

  @Post("assignments/:id/deliver")
  deliver(@CurrentCourier() courier: CurrentCourier, @Param("id") id: string) {
    return this.courier.deliver(courier.courierProfileId, id);
  }

  @Post("assignments/:id/cancel")
  cancel(@CurrentCourier() courier: CurrentCourier, @Param("id") id: string, @Body() dto: CancelAssignmentDto) {
    return this.courier.cancel(courier.courierProfileId, id, dto.reason);
  }
}
