import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AdoptionService } from "./adoption.service";
import { CreateAdoptionPostDto } from "./dto";
import { OwnerAuthGuard } from "../auth/owner-auth.guard";
import { CurrentUser, CurrentOwner } from "../auth/current-user.decorator";

@Controller("adoption-posts")
export class AdoptionController {
  constructor(private readonly adoption: AdoptionService) {}

  @Get()
  list() {
    return this.adoption.list();
  }

  @Get(":id")
  detail(@Param("id") id: string) {
    return this.adoption.detail(id);
  }

  @UseGuards(OwnerAuthGuard)
  @Post()
  create(@CurrentUser() user: CurrentOwner, @Body() dto: CreateAdoptionPostDto) {
    return this.adoption.create(user.ownerProfileId, dto);
  }
}
