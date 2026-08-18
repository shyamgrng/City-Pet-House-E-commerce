import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { AdminAuthService } from "./admin-auth.service";
import { AdminAuthController } from "./admin-auth.controller";
import { AdminJwtStrategy } from "./admin-jwt.strategy";
import { DoctorAuthService } from "./doctor-auth.service";
import { DoctorAuthController } from "./doctor-auth.controller";
import { DoctorJwtStrategy } from "./doctor-jwt.strategy";
import { CartModule } from "../cart/cart.module";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET ?? "dev-secret-change-me",
    }),
    CartModule,
  ],
  providers: [AuthService, JwtStrategy, AdminAuthService, AdminJwtStrategy, DoctorAuthService, DoctorJwtStrategy],
  controllers: [AuthController, AdminAuthController, DoctorAuthController],
  exports: [AuthService, AdminAuthService, DoctorAuthService],
})
export class AuthModule {}
