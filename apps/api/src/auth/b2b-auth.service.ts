import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { generateRefreshTokenValue, hashToken } from "./token.util";
import { LoginDto, RegisterB2BDto } from "./dto";

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const B2B_AUDIENCE = "b2b";

export interface B2BAuthTokens {
  accessToken: string;
  refreshToken: string;
  supplier: {
    id: string;
    companyName: string;
    contactName: string;
    email: string;
    commissionPct: number;
    verified: boolean;
  };
}

type B2BProfile = {
  id: string;
  companyName: string;
  contactName: string;
  commissionPct: number;
  verified: boolean;
};

/**
 * Unlike Doctor (admin-provisioned only), B2B suppliers self-register —
 * account starts PENDING_VERIFICATION/unverified and can still sign in
 * (the portal shows a pending-approval state) until an admin approves it
 * from the Pending Registrations screen.
 */
@Injectable()
export class B2BAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterB2BDto): Promise<B2BAuthTokens> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("An account with this email already exists.");

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: "B2B_SUPPLIER",
        status: "PENDING_VERIFICATION",
        b2bProfile: {
          create: {
            companyName: dto.companyName,
            contactName: dto.contactName,
            phone: dto.phone,
            altPhone: dto.altPhone,
            address: dto.address,
            categories: dto.categories ?? [],
            verified: false,
          },
        },
      },
      include: { b2bProfile: true },
    });

    return this.issueTokens(user.id, user.email, user.b2bProfile!);
  }

  async login(dto: LoginDto): Promise<B2BAuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { b2bProfile: true },
    });
    if (!user || user.role !== "B2B_SUPPLIER" || !user.b2bProfile || user.status === "SUSPENDED") {
      throw new UnauthorizedException("Invalid email or password.");
    }
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password.");
    }
    return this.issueTokens(user.id, user.email, user.b2bProfile);
  }

  async refresh(refreshToken: string): Promise<B2BAuthTokens> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { b2bProfile: true } } },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.audience !== B2B_AUDIENCE) {
      throw new UnauthorizedException("Session expired, please sign in again.");
    }
    if (!stored.user.b2bProfile || stored.user.status === "SUSPENDED") {
      throw new UnauthorizedException("Session expired, please sign in again.");
    }

    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

    return this.issueTokens(stored.user.id, stored.user.email, stored.user.b2bProfile);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(userId: string, email: string, profile: B2BProfile): Promise<B2BAuthTokens> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, aud: B2B_AUDIENCE, role: "B2B_SUPPLIER" },
      { expiresIn: "15m" },
    );

    const refreshToken = generateRefreshTokenValue();
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        audience: B2B_AUDIENCE,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return {
      accessToken,
      refreshToken,
      supplier: {
        id: profile.id,
        companyName: profile.companyName,
        contactName: profile.contactName,
        email,
        commissionPct: profile.commissionPct,
        verified: profile.verified,
      },
    };
  }
}
