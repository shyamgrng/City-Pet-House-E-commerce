import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { ADMIN_SECTIONS } from "./admin-sections";
import { CreateAdminUserDto, UpdateAdminUserDto } from "./dto";

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const users = await this.prisma.user.findMany({
      where: { role: "ADMIN_STAFF" },
      include: { adminProfile: { include: { permissions: true } } },
      orderBy: { createdAt: "asc" },
    });
    return users.map(this.toDto);
  }

  async create(dto: CreateAdminUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("An account with this email already exists.");

    const passwordHash = await argon2.hash(dto.password);
    const permissions = ADMIN_SECTIONS.map((section) => ({ section, granted: !!dto.permissions[section] }));

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: "ADMIN_STAFF",
        adminProfile: {
          create: { name: dto.name, role: dto.role, permissions: { create: permissions } },
        },
      },
      include: { adminProfile: { include: { permissions: true } } },
    });
    return this.toDto(user);
  }

  async update(userId: string, dto: UpdateAdminUserDto, requestingUserId: string) {
    const user = await this.getOrThrow(userId);

    if (userId === requestingUserId && (dto.status === "SUSPENDED" || dto.permissions?.users === false)) {
      throw new ForbiddenException("You can't revoke your own Users access or suspend your own account.");
    }

    if (dto.status) {
      await this.prisma.user.update({ where: { id: userId }, data: { status: dto.status } });
    }
    if (dto.name || dto.role) {
      await this.prisma.adminStaffProfile.update({
        where: { id: user.adminProfile!.id },
        data: { ...(dto.name ? { name: dto.name } : {}), ...(dto.role ? { role: dto.role } : {}) },
      });
    }
    if (dto.permissions) {
      await Promise.all(
        ADMIN_SECTIONS.filter((section) => section in dto.permissions!).map((section) =>
          this.prisma.rolePermission.upsert({
            where: { staffId_section: { staffId: user.adminProfile!.id, section } },
            update: { granted: dto.permissions![section] },
            create: { staffId: user.adminProfile!.id, section, granted: dto.permissions![section] },
          }),
        ),
      );
    }

    return this.list().then((all) => all.find((u) => u.id === userId));
  }

  private async getOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });
    if (!user || user.role !== "ADMIN_STAFF" || !user.adminProfile) {
      throw new NotFoundException("Admin account not found.");
    }
    return user;
  }

  private toDto(user: {
    id: string;
    email: string;
    status: string;
    adminProfile: { name: string; role: string; permissions: { section: string; granted: boolean }[] } | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      name: user.adminProfile!.name,
      role: user.adminProfile!.role,
      permissions: Object.fromEntries(user.adminProfile!.permissions.map((p) => [p.section, p.granted])),
    };
  }
}
