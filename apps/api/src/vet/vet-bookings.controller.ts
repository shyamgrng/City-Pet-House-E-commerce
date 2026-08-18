import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { VetService } from "./vet.service";
import { CreateVetBookingDto } from "./dto";
import { OwnerAuthGuard } from "../auth/owner-auth.guard";
import { CurrentUser, CurrentOwner } from "../auth/current-user.decorator";

@UseGuards(OwnerAuthGuard)
@Controller("vet/bookings")
export class VetBookingsController {
  constructor(private readonly vet: VetService) {}

  @Post()
  create(@CurrentUser() user: CurrentOwner, @Body() dto: CreateVetBookingDto) {
    return this.vet.createBooking(user.ownerProfileId, dto);
  }

  @Get("mine")
  listMine(@CurrentUser() user: CurrentOwner) {
    return this.vet.listMine(user.ownerProfileId);
  }
}
