import { Body, Controller, Post } from "@nestjs/common";
import { B2BAuthService } from "./b2b-auth.service";
import { LoginDto, RefreshDto, RegisterB2BDto } from "./dto";

@Controller("auth/b2b")
export class B2BAuthController {
  constructor(private readonly auth: B2BAuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterB2BDto) {
    return this.auth.register(dto);
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
}
