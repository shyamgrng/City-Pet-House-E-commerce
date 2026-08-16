import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterOwnerDto, LoginDto, RefreshDto } from "./dto";
import { OwnerAuthGuard } from "./owner-auth.guard";
import { CurrentUser, CurrentOwner } from "./current-user.decorator";
import { CartService } from "../cart/cart.service";

@Controller("auth/owner")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cart: CartService,
  ) {}

  @Post("register")
  async register(@Body() dto: RegisterOwnerDto) {
    return this.auth.registerOwner(dto);
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post("refresh")
  async refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post("logout")
  async logout(@Body() dto: RefreshDto) {
    await this.auth.logout(dto.refreshToken);
    return { ok: true };
  }

  /** Merges an anonymous device cart into the signed-in owner's cart right after login/register, per the "cart survives sign-in" requirement. */
  @UseGuards(OwnerAuthGuard)
  @Post("merge-cart")
  async mergeCart(@CurrentUser() user: CurrentOwner, @Body("deviceKey") deviceKey: string | undefined) {
    if (!deviceKey) return { ok: true };
    await this.cart.mergeDeviceCartIntoOwner(deviceKey, user.ownerProfileId);
    return { ok: true };
  }
}
