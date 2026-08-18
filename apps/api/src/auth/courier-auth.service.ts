import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { generateRefreshTokenValue, hashToken } from "./token.util";
import { LoginDto, RegisterCourierDto } from "./dto";

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const COURIER_AUDIENCE = "courier";

export interface CourierAuthTokens {
  accessToken: string;
  refreshToken: string;
  courier: {
    id: string;
    companyName: string;
    contactName: string;
    email: string;
    verified: boolean;
  };
}

type CourierProfileFields = {
  id: string;
  companyName: string;
  contactName: string;
  verified: boolean;
};

/**
 * Same self-registration shape as B2B (see b2b-auth.service.ts) — a courier
 * account starts PENDING_VERIFICATION/unverified and can still sign in (the
 * portal shows a pending-approval state) until an admin approves it from
 * the Pending Registrations screen.
 */
@Injectable()
export class CourierAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterCourierDto): Promise<CourierAuthTokens> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("An account with this email already exists.");

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: "COURIER",
        status: "PENDING_VERIFICATION",
        courierProfile: {
          create: {
            companyName: dto.companyName,
            contactName: dto.contactName,
            phone: dto.phone,
            altPhone: dto.altPhone,
            address: dto.address,
            verified: false,
          },
        },
      },
      include: { courierProfile: true },
    });

    return this.issueTokens(user.id, user.email, user.courierProfile!);
  }

  async login(dto: LoginDto): Promise<CourierAuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { courierProfile: true },
    });
    if (!user || user.role !== "COURIER" || !user.courierProfile || user.status === "SUSPENDED") {
      throw new UnauthorizedException("Invalid email or password.");
    }
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password.");
    }
    return this.issueTokens(user.id, user.email, user.courierProfile);
  }

  async refresh(refreshToken: string): Promise<CourierAuthTokens> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { courierProfile: true } } },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.audience !== COURIER_AUDIENCE) {
      throw new UnauthorizedException("Session expired, please sign in again.");
    }
    if (!stored.user.courierProfile || stored.user.status === "SUSPENDED") {
      throw new UnauthorizedException("Session expired, please sign in again.");
    }

    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

    return this.issueTokens(stored.user.id, stored.user.email, stored.user.courierProfile);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(userId: string, email: string, profile: CourierProfileFields): Promise<CourierAuthTokens> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, aud: COURIER_AUDIENCE, role: "COURIER" },
      { expiresIn: "15m" },
    );

    const refreshToken = generateRefreshTokenValue();
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        audience: COURIER_AUDIENCE,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return {
      accessToken,
      refreshToken,
      courier: {
        id: profile.id,
        companyName: profile.companyName,
        contactName: profile.contactName,
        email,
        verified: profile.verified,
      },
    };
  }
}
