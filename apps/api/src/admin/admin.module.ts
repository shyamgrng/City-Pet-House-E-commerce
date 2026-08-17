import { Module } from "@nestjs/common";
import { AdminOrdersService } from "./admin-orders.service";
import { AdminOrdersController } from "./admin-orders.controller";
import { AdminProductsService } from "./admin-products.service";
import { AdminProductsController } from "./admin-products.controller";
import { AdminUsersService } from "./admin-users.service";
import { AdminUsersController } from "./admin-users.controller";
import { AdminServicesService } from "./admin-services.service";
import { AdminServicesController } from "./admin-services.controller";
import { AdminPetsService } from "./admin-pets.service";
import { AdminPetsController } from "./admin-pets.controller";

@Module({
  providers: [AdminOrdersService, AdminProductsService, AdminUsersService, AdminServicesService, AdminPetsService],
  controllers: [
    AdminOrdersController,
    AdminProductsController,
    AdminUsersController,
    AdminServicesController,
    AdminPetsController,
  ],
})
export class AdminModule {}
