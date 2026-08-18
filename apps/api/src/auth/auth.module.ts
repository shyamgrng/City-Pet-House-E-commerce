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
import { B2BAuthService } from "./b2b-auth.service";
import { B2BAuthController } from "./b2b-auth.controller";
import { B2BJwtStrategy } from "./b2b-jwt.strategy";
import { CartModule } from "../cart/cart.module";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET ?? "dev-secret-change-me",
    }),
    CartModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    AdminAuthService,
    AdminJwtStrategy,
    DoctorAuthService,
    DoctorJwtStrategy,
    B2BAuthService,
    B2BJwtStrategy,
  ],
  controllers: [AuthController, AdminAuthController, DoctorAuthController, B2BAuthController],
  exports: [AuthService, AdminAuthService, DoctorAuthService, B2BAuthService],
})
export class AuthModule {}
