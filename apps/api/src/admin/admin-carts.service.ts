import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminCartsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Non-empty carts that haven't converted to an order yet — abandoned-cart visibility for follow-up/marketing. */
  async list() {
    const carts = await this.prisma.cart.findMany({
      where: { items: { some: {} } },
      include: {
        owner: { include: { user: { select: { email: true, phone: true } } } },
        items: { include: { product: { select: { name: true, price: true, images: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return carts.map((cart) => {
      const items = cart.items.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        unitPrice: item.product.price,
        qty: item.qty,
        image: item.product.images[0] ?? null,
      }));
      const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
      return {
        id: cart.id,
        customer: cart.owner
          ? { name: cart.owner.name, email: cart.owner.user.email, phone: cart.owner.user.phone }
          : null, // null = anonymous/guest cart, only identified by device
        items,
        subtotal,
        updatedAt: cart.updatedAt,
      };
    });
  }
}
