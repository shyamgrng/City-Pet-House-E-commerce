import { Module } from "@nestjs/common";
import { AdminOrdersService } from "./admin-orders.service";
import { AdminOrdersController } from "./admin-orders.controller";
import { AdminProductsService } from "./admin-products.service";
import { AdminProductsController } from "./admin-products.controller";
import { AdminUsersService } from "./admin-users.service";
import { AdminUsersController } from "./admin-users.controller";
import { AdminServicesService } from "./admin-services.service";
import { AdminServicesController } from "./admin-services.controller";

@Module({
  providers: [AdminOrdersService, AdminProductsService, AdminUsersService, AdminServicesService],
  controllers: [AdminOrdersController, AdminProductsController, AdminUsersController, AdminServicesController],
})
export class AdminModule {}
