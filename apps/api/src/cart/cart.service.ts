import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface CartOwnerRef {
  ownerProfileId?: string;
  deviceKey?: string;
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateCart(ref: CartOwnerRef) {
    if (!ref.ownerProfileId && !ref.deviceKey) {
      throw new BadRequestException("Sign in or supply a device key to use a cart.");
    }
    const where = ref.ownerProfileId ? { ownerId: ref.ownerProfileId } : { deviceKey: ref.deviceKey };
    const create = ref.ownerProfileId ? { ownerId: ref.ownerProfileId } : { deviceKey: ref.deviceKey };
    try {
      // upsert (not find-then-create) — concurrent requests for a
      // brand-new cart (e.g. header cart count + page fetch firing
      // together in React StrictMode's double effect) would otherwise
      // both miss a plain findUnique and race on the unique constraint.
      return await this.prisma.cart.upsert({ where, update: {}, create });
    } catch (e) {
      // Prisma's upsert isn't a single atomic statement on every target —
      // under a genuine simultaneous race the loser can still hit P2002;
      // the winner's row is now there, so just read it.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return this.prisma.cart.findUniqueOrThrow({ where });
      }
      throw e;
    }
  }

  async getCart(ref: CartOwnerRef) {
    const cart = await this.getOrCreateCart(ref);
    return this.withComputedTotals(cart.id);
  }

  async addItem(ref: CartOwnerRef, productId: string, qty: number) {
    const cart = await this.getOrCreateCart(ref);
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException("Product not found.");

    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { qty: { increment: qty } },
      create: { cartId: cart.id, productId, qty },
    });
    return this.withComputedTotals(cart.id);
  }

  async updateItem(ref: CartOwnerRef, productId: string, qty: number) {
    const cart = await this.getOrCreateCart(ref);
    if (qty <= 0) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    } else {
      await this.prisma.cartItem.updateMany({ where: { cartId: cart.id, productId }, data: { qty } });
    }
    return this.withComputedTotals(cart.id);
  }

  async removeItem(ref: CartOwnerRef, productId: string) {
    const cart = await this.getOrCreateCart(ref);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    return this.withComputedTotals(cart.id);
  }

  /** Called right after login/register so an anonymous cart isn't lost (README: "cart survives sign-in"). */
  async mergeDeviceCartIntoOwner(deviceKey: string, ownerProfileId: string) {
    const deviceCart = await this.prisma.cart.findUnique({
      where: { deviceKey },
      include: { items: true },
    });
    if (!deviceCart) return;

    const ownerCart = await this.getOrCreateCart({ ownerProfileId });
    for (const item of deviceCart.items) {
      await this.prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: ownerCart.id, productId: item.productId } },
        update: { qty: { increment: item.qty } },
        create: { cartId: ownerCart.id, productId: item.productId, qty: item.qty },
      });
    }
    await this.prisma.cart.delete({ where: { id: deviceCart.id } });
  }

  private async withComputedTotals(cartId: string) {
    const cart = await this.prisma.cart.findUniqueOrThrow({
      where: { id: cartId },
      include: { items: { include: { product: true } } },
    });
    const items = cart.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      unitPrice: item.product.price,
      qty: item.qty,
      image: item.product.images[0] ?? null,
      outOfStock: item.product.outOfStock,
    }));
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
    // Delivery fee is 0 when the cart is empty — computed, never stored per-cart.
    const deliveryFee = items.length === 0 ? 0 : 100;
    return { id: cart.id, items, subtotal, deliveryFee, total: subtotal + deliveryFee };
  }
}
