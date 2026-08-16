import { Module } from "@nestjs/common";
import { AdminOrdersService } from "./admin-orders.service";
import { AdminOrdersController } from "./admin-orders.controller";
import { AdminProductsService } from "./admin-products.service";
import { AdminProductsController } from "./admin-products.controller";

@Module({
  providers: [AdminOrdersService, AdminProductsService],
  controllers: [AdminOrdersController, AdminProductsController],
})
export class AdminModule {}
