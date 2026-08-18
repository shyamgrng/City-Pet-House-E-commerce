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
import { AdminAdoptionService } from "./admin-adoption.service";
import { AdminAdoptionController } from "./admin-adoption.controller";
import { AdminVetConsultsService } from "./admin-vet-consults.service";
import { AdminVetConsultsController } from "./admin-vet-consults.controller";
import { AdminBlogService } from "./admin-blog.service";
import { AdminBlogController } from "./admin-blog.controller";

@Module({
  providers: [
    AdminOrdersService,
    AdminProductsService,
    AdminUsersService,
    AdminServicesService,
    AdminPetsService,
    AdminAdoptionService,
    AdminVetConsultsService,
    AdminBlogService,
  ],
  controllers: [
    AdminOrdersController,
    AdminProductsController,
    AdminUsersController,
    AdminServicesController,
    AdminPetsController,
    AdminAdoptionController,
    AdminVetConsultsController,
    AdminBlogController,
  ],
})
export class AdminModule {}
