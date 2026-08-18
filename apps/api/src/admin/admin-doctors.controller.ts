import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminDoctorsService } from "./admin-doctors.service";
import { CreateDoctorDto, UpdateDoctorDto } from "./dto";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { CurrentAdmin, requirePermission } from "../auth/current-admin.decorator";

@UseGuards(AdminAuthGuard)
@Controller("admin/doctors")
export class AdminDoctorsController {
  constructor(private readonly doctors: AdminDoctorsService) {}

  @Get()
  list(@CurrentAdmin() admin: CurrentAdmin) {
    requirePermission(admin, "vetconsults");
    return this.doctors.list();
  }

  @Post()
  create(@CurrentAdmin() admin: CurrentAdmin, @Body() dto: CreateDoctorDto) {
    requirePermission(admin, "vetconsults");
    return this.doctors.create(dto);
  }

  @Patch(":id")
  update(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string, @Body() dto: UpdateDoctorDto) {
    requirePermission(admin, "vetconsults");
    return this.doctors.update(id, dto);
  }
}
