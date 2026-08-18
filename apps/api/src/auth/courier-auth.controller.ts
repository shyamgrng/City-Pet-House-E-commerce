import { Body, Controller, Post } from "@nestjs/common";
import { CourierAuthService } from "./courier-auth.service";
import { LoginDto, RefreshDto, RegisterCourierDto } from "./dto";

@Controller("auth/courier")
export class CourierAuthController {
  constructor(private readonly auth: CourierAuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterCourierDto) {
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
