import { Module } from "@nestjs/common";
import { AdminOrdersService } from "./admin-orders.service";
import { AdminOrdersController } from "./admin-orders.controller";
import { AdminProductsService } from "./admin-products.service";
import { AdminProductsController } from "./admin-products.controller";
import { AdminUsersService } from "./admin-users.service";
import { AdminUsersController } from "./admin-users.controller";

@Module({
  providers: [AdminOrdersService, AdminProductsService, AdminUsersService],
  controllers: [AdminOrdersController, AdminProductsController, AdminUsersController],
})
export class AdminModule {}
