import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertAddressDto, UpdateProfileDto } from "./dto";

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { petOwnerProfile: true },
    });
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.petOwnerProfile!.name,
    };
  }

  async updateProfile(userId: string, ownerProfileId: string, dto: UpdateProfileDto) {
    if (dto.name) {
      await this.prisma.petOwnerProfile.update({ where: { id: ownerProfileId }, data: { name: dto.name } });
    }
    if (dto.phone) {
      await this.prisma.user.update({ where: { id: userId }, data: { phone: dto.phone } });
    }
    return this.me(userId);
  }

  async listAddresses(ownerProfileId: string) {
    return this.prisma.address.findMany({
      where: { ownerId: ownerProfileId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });
  }

  async addAddress(ownerProfileId: string, dto: UpsertAddressDto) {
    if (dto.isPrimary) {
      await this.prisma.address.updateMany({ where: { ownerId: ownerProfileId }, data: { isPrimary: false } });
    }
    return this.prisma.address.create({ data: { ...dto, ownerId: ownerProfileId } });
  }

  async updateAddress(ownerProfileId: string, addressId: string, dto: UpsertAddressDto) {
    const existing = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!existing) throw new NotFoundException("Address not found.");
    if (existing.ownerId !== ownerProfileId) throw new ForbiddenException();

    if (dto.isPrimary) {
      await this.prisma.address.updateMany({ where: { ownerId: ownerProfileId }, data: { isPrimary: false } });
    }
    return this.prisma.address.update({ where: { id: addressId }, data: dto });
  }

  async removeAddress(ownerProfileId: string, addressId: string) {
    const existing = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!existing) throw new NotFoundException("Address not found.");
    if (existing.ownerId !== ownerProfileId) throw new ForbiddenException();
    await this.prisma.address.delete({ where: { id: addressId } });
    return { ok: true };
  }

  async wishlist(ownerProfileId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { ownerId: ownerProfileId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    return items.map((item) => item.product);
  }

  async addWishlist(ownerProfileId: string, productId: string) {
    await this.prisma.wishlistItem.upsert({
      where: { ownerId_productId: { ownerId: ownerProfileId, productId } },
      update: {},
      create: { ownerId: ownerProfileId, productId },
    });
    return this.wishlist(ownerProfileId);
  }

  async removeWishlist(ownerProfileId: string, productId: string) {
    await this.prisma.wishlistItem.deleteMany({ where: { ownerId: ownerProfileId, productId } });
    return this.wishlist(ownerProfileId);
  }
}
