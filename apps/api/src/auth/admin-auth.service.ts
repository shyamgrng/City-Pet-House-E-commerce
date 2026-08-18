import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { generateRefreshTokenValue, hashToken } from "./token.util";
import { LoginDto } from "./dto";

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const ADMIN_AUDIENCE = "admin";

export interface AdminAuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: Record<string, boolean>;
  };
}

/**
 * No self-registration — admin/staff accounts are provisioned by another
 * admin (User Roles & Permissions screen, not built yet) or seeded. This
 * mirrors the prototype's usersData: staff sign-in is a wholly separate
 * identity from pet-owner sign-in (README §Interactions).
 */
@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AdminAuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { adminProfile: { include: { permissions: true } } },
    });
    if (!user || user.role !== "ADMIN_STAFF" || !user.adminProfile || user.status !== "ACTIVE") {
      throw new UnauthorizedException("Invalid email or password.");
    }
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password.");
    }
    return this.issueTokens(user.id, user.adminProfile.name, user.email, user.adminProfile.role, user.adminProfile.permissions);
  }

  async refresh(refreshToken: string): Promise<AdminAuthTokens> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { adminProfile: { include: { permissions: true } } } } },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.audience !== ADMIN_AUDIENCE) {
      throw new UnauthorizedException("Session expired, please sign in again.");
    }
    if (!stored.user.adminProfile || stored.user.status !== "ACTIVE") {
      throw new UnauthorizedException("Session expired, please sign in again.");
    }

    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

    return this.issueTokens(
      stored.user.id,
      stored.user.adminProfile.name,
      stored.user.email,
      stored.user.adminProfile.role,
      stored.user.adminProfile.permissions,
    );
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(
    userId: string,
    name: string,
    email: string,
    role: string,
    permissionRows: { section: string; granted: boolean }[],
  ): Promise<AdminAuthTokens> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, aud: ADMIN_AUDIENCE, role: "ADMIN_STAFF" },
      { expiresIn: "15m" },
    );

    const refreshToken = generateRefreshTokenValue();
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        audience: ADMIN_AUDIENCE,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    const permissions = Object.fromEntries(permissionRows.map((p) => [p.section, p.granted]));
    return { accessToken, refreshToken, user: { id: userId, name, email, role, permissions } };
  }
}
