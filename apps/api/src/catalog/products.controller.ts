import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(
    @Query("category") category?: string,
    @Query("brand") brand?: string,
    @Query("minRating") minRating?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string,
    @Query("search") search?: string,
    @Query("ids") ids?: string,
  ) {
    return this.products.list({
      category,
      brand,
      minRating: minRating ? Number(minRating) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      search,
      ids: ids ? ids.split(",").filter(Boolean) : undefined,
    });
  }

  @Get("deals/today")
  todaysDeals() {
    return this.products.todaysDeals();
  }

  @Get(":id")
  detail(@Param("id") id: string) {
    return this.products.detail(id);
  }

  @Get(":id/similar")
  similar(@Param("id") id: string) {
    return this.products.similar(id);
  }
}
