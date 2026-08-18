import { Body, Controller, Post } from "@nestjs/common";
import { DoctorAuthService } from "./doctor-auth.service";
import { LoginDto, RefreshDto } from "./dto";

@Controller("auth/doctor")
export class DoctorAuthController {
  constructor(private readonly auth: DoctorAuthService) {}

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
