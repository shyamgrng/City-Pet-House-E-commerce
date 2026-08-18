import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { VetBookingStatus } from "@prisma/client";
import { DoctorService } from "./doctor.service";
import { SetDoctorOnlineDto } from "./dto";
import { DoctorAuthGuard } from "../auth/doctor-auth.guard";
import { CurrentDoctor } from "../auth/current-doctor.decorator";

@UseGuards(DoctorAuthGuard)
@Controller("doctor")
export class DoctorController {
  constructor(private readonly doctor: DoctorService) {}

  @Get("me")
  me(@CurrentDoctor() doctor: CurrentDoctor) {
    return this.doctor.me(doctor.doctorProfileId);
  }

  @Patch("me/online")
  setOnline(@CurrentDoctor() doctor: CurrentDoctor, @Body() dto: SetDoctorOnlineDto) {
    return this.doctor.setOnline(doctor.doctorProfileId, dto.online);
  }

  @Get("bookings")
  bookings(@CurrentDoctor() doctor: CurrentDoctor, @Query("status") status?: VetBookingStatus) {
    return this.doctor.bookings(doctor.doctorProfileId, status);
  }

  @Post("bookings/:id/confirm")
  confirm(@CurrentDoctor() doctor: CurrentDoctor, @Param("id") id: string) {
    return this.doctor.confirm(doctor.doctorProfileId, id);
  }

  @Post("bookings/:id/complete")
  complete(@CurrentDoctor() doctor: CurrentDoctor, @Param("id") id: string) {
    return this.doctor.complete(doctor.doctorProfileId, id);
  }
}
