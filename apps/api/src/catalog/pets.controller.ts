import { Controller, Get, Param, Query } from "@nestjs/common";
import { PetsService } from "./pets.service";

@Controller("pets")
export class PetsController {
  constructor(private readonly pets: PetsService) {}

  @Get()
  list(@Query("species") species?: string) {
    return this.pets.list(species);
  }

  @Get(":id")
  detail(@Param("id") id: string) {
    return this.pets.detail(id);
  }

  @Get(":id/similar")
  similar(@Param("id") id: string) {
    return this.pets.similar(id);
  }
}
