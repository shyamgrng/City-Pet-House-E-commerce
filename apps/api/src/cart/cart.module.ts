import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET ?? "dev-secret-change-me",
    }),
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
