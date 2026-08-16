import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CartService, CartOwnerRef } from "./cart.service";
import { PrismaService } from "../prisma/prisma.service";
import { AddCartItemDto, UpdateCartItemDto } from "./dto";

@Controller("cart")
export class CartController {
  constructor(
    private readonly cart: CartService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Cart works signed-out (keyed by a client-generated device key) or
   * signed-in (keyed by the owner profile from the bearer token) — the
   * device cart is merged into the owner's cart on login via
   * POST /auth/owner/merge-cart, so nothing is lost.
   */
  private async resolveRef(authHeader: string | undefined, deviceKey: string | undefined): Promise<CartOwnerRef> {
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const payload = await this.jwt.verifyAsync(authHeader.slice(7), {
          secret: process.env.JWT_ACCESS_SECRET ?? "dev-secret-change-me",
        });
        if (payload.aud === "owner") {
          const profile = await this.prisma.petOwnerProfile.findUnique({ where: { userId: payload.sub } });
          if (profile) return { ownerProfileId: profile.id };
        }
      } catch {
        // fall through to device-key cart
      }
    }
    return { deviceKey };
  }

  @Get()
  async getCart(@Headers("authorization") auth?: string, @Query("deviceKey") deviceKey?: string) {
    return this.cart.getCart(await this.resolveRef(auth, deviceKey));
  }

  @Post("items")
  async addItem(@Headers("authorization") auth: string | undefined, @Body() dto: AddCartItemDto) {
    return this.cart.addItem(await this.resolveRef(auth, dto.deviceKey), dto.productId, dto.qty);
  }

  @Patch("items/:productId")
  async updateItem(
    @Headers("authorization") auth: string | undefined,
    @Param("productId") productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cart.updateItem(await this.resolveRef(auth, dto.deviceKey), productId, dto.qty);
  }

  @Delete("items/:productId")
  async removeItem(
    @Headers("authorization") auth: string | undefined,
    @Param("productId") productId: string,
    @Query("deviceKey") deviceKey?: string,
  ) {
    return this.cart.removeItem(await this.resolveRef(auth, deviceKey), productId);
  }
}
