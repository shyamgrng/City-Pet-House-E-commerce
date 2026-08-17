import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminUsersService } from "./admin-users.service";
import { CreateAdminUserDto, UpdateAdminUserDto } from "./dto";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { CurrentAdmin, requirePermission } from "../auth/current-admin.decorator";

@UseGuards(AdminAuthGuard)
@Controller("admin/users")
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  list(@CurrentAdmin() admin: CurrentAdmin) {
    requirePermission(admin, "users");
    return this.users.list();
  }

  @Post()
  create(@CurrentAdmin() admin: CurrentAdmin, @Body() dto: CreateAdminUserDto) {
    requirePermission(admin, "users");
    return this.users.create(dto);
  }

  @Patch(":id")
  update(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string, @Body() dto: UpdateAdminUserDto) {
    requirePermission(admin, "users");
    return this.users.update(id, dto, admin.userId);
  }
}
