import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminPetsService } from "./admin-pets.service";
import { UpsertPetListingDto } from "./dto";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { CurrentAdmin, requirePermission } from "../auth/current-admin.decorator";

@UseGuards(AdminAuthGuard)
@Controller("admin/pets")
export class AdminPetsController {
  constructor(private readonly pets: AdminPetsService) {}

  @Get()
  list(@CurrentAdmin() admin: CurrentAdmin) {
    requirePermission(admin, "shop");
    return this.pets.list();
  }

  @Post()
  create(@CurrentAdmin() admin: CurrentAdmin, @Body() dto: UpsertPetListingDto) {
    requirePermission(admin, "shop");
    return this.pets.create(dto);
  }

  @Patch(":id")
  update(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string, @Body() dto: Partial<UpsertPetListingDto>) {
    requirePermission(admin, "shop");
    return this.pets.update(id, dto);
  }

  @Delete(":id")
  remove(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string) {
    requirePermission(admin, "shop");
    return this.pets.remove(id);
  }
}
