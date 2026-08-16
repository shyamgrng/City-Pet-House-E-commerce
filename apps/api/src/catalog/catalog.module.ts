import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { PetsController } from "./pets.controller";
import { PetsService } from "./pets.service";
import { AdoptionController } from "./adoption.controller";
import { AdoptionService } from "./adoption.service";

@Module({
  controllers: [ProductsController, PetsController, AdoptionController],
  providers: [ProductsService, PetsService, AdoptionService],
  exports: [ProductsService, PetsService],
})
export class CatalogModule {}
