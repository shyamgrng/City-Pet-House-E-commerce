import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { AdminAuthService } from "./admin-auth.service";
import { AdminAuthController } from "./admin-auth.controller";
import { AdminJwtStrategy } from "./admin-jwt.strategy";
import { CartModule } from "../cart/cart.module";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET ?? "dev-secret-change-me",
    }),
    CartModule,
  ],
  providers: [AuthService, JwtStrategy, AdminAuthService, AdminJwtStrategy],
  controllers: [AuthController, AdminAuthController],
  exports: [AuthService, AdminAuthService],
})
export class AuthModule {}
