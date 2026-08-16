import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminProductsService } from "./admin-products.service";
import { UpsertProductDto } from "./dto";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { CurrentAdmin, requirePermission } from "../auth/current-admin.decorator";

@UseGuards(AdminAuthGuard)
@Controller("admin/products")
export class AdminProductsController {
  constructor(private readonly products: AdminProductsService) {}

  @Get()
  list(@CurrentAdmin() admin: CurrentAdmin) {
    requirePermission(admin, "shop");
    return this.products.list();
  }

  @Post()
  create(@CurrentAdmin() admin: CurrentAdmin, @Body() dto: UpsertProductDto) {
    requirePermission(admin, "shop");
    return this.products.create(dto);
  }

  @Patch(":id")
  update(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string, @Body() dto: Partial<UpsertProductDto>) {
    requirePermission(admin, "shop");
    return this.products.update(id, dto);
  }

  @Delete(":id")
  remove(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string) {
    requirePermission(admin, "shop");
    return this.products.remove(id);
  }

  @Patch(":id/out-of-stock")
  toggleOutOfStock(@CurrentAdmin() admin: CurrentAdmin, @Param("id") id: string, @Body("outOfStock") outOfStock: boolean) {
    requirePermission(admin, "shop");
    return this.products.toggleOutOfStock(id, outOfStock);
  }
}
