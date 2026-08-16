import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AccountService } from "./account.service";
import { UpsertAddressDto, UpdateProfileDto } from "./dto";
import { OwnerAuthGuard } from "../auth/owner-auth.guard";
import { CurrentUser, CurrentOwner } from "../auth/current-user.decorator";

@UseGuards(OwnerAuthGuard)
@Controller()
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Get("me")
  me(@CurrentUser() user: CurrentOwner) {
    return this.account.me(user.userId);
  }

  @Patch("me")
  updateProfile(@CurrentUser() user: CurrentOwner, @Body() dto: UpdateProfileDto) {
    return this.account.updateProfile(user.userId, user.ownerProfileId, dto);
  }

  @Get("addresses")
  listAddresses(@CurrentUser() user: CurrentOwner) {
    return this.account.listAddresses(user.ownerProfileId);
  }

  @Post("addresses")
  addAddress(@CurrentUser() user: CurrentOwner, @Body() dto: UpsertAddressDto) {
    return this.account.addAddress(user.ownerProfileId, dto);
  }

  @Patch("addresses/:id")
  updateAddress(@CurrentUser() user: CurrentOwner, @Param("id") id: string, @Body() dto: UpsertAddressDto) {
    return this.account.updateAddress(user.ownerProfileId, id, dto);
  }

  @Delete("addresses/:id")
  removeAddress(@CurrentUser() user: CurrentOwner, @Param("id") id: string) {
    return this.account.removeAddress(user.ownerProfileId, id);
  }

  @Get("wishlist")
  wishlist(@CurrentUser() user: CurrentOwner) {
    return this.account.wishlist(user.ownerProfileId);
  }

  @Post("wishlist/:productId")
  addWishlist(@CurrentUser() user: CurrentOwner, @Param("productId") productId: string) {
    return this.account.addWishlist(user.ownerProfileId, productId);
  }

  @Delete("wishlist/:productId")
  removeWishlist(@CurrentUser() user: CurrentOwner, @Param("productId") productId: string) {
    return this.account.removeWishlist(user.ownerProfileId, productId);
  }
}
