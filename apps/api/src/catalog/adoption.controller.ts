import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AdoptionService } from "./adoption.service";
import { CreateAdoptionPostDto, UpdateOwnAdoptionStatusDto } from "./dto";
import { OwnerAuthGuard } from "../auth/owner-auth.guard";
import { CurrentUser, CurrentOwner } from "../auth/current-user.decorator";

@Controller("adoption-posts")
export class AdoptionController {
  constructor(private readonly adoption: AdoptionService) {}

  @Get()
  list() {
    return this.adoption.list();
  }

  // Must come before :id — otherwise Nest would match "mine" as an :id param.
  @UseGuards(OwnerAuthGuard)
  @Get("mine")
  mine(@CurrentUser() user: CurrentOwner) {
    return this.adoption.mine(user.ownerProfileId);
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

  @UseGuards(OwnerAuthGuard)
  @Patch(":id/status")
  updateOwnStatus(@CurrentUser() user: CurrentOwner, @Param("id") id: string, @Body() dto: UpdateOwnAdoptionStatusDto) {
    return this.adoption.updateOwnStatus(user.ownerProfileId, id, dto.status);
  }
}
