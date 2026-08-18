import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { generateRefreshTokenValue, hashToken } from "./token.util";
import { RegisterOwnerDto, LoginDto } from "./dto";

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const OWNER_AUDIENCE = "owner";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async registerOwner(dto: RegisterOwnerDto): Promise<AuthTokens> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists.");
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: "PET_OWNER",
        petOwnerProfile: {
          create: {
            name: dto.name,
          },
        },
      },
      include: { petOwnerProfile: true },
    });

    return this.issueTokens(user.id, user.petOwnerProfile!.name, user.email);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { petOwnerProfile: true },
    });
    if (!user || user.role !== "PET_OWNER" || !user.petOwnerProfile || user.status === "SUSPENDED") {
      throw new UnauthorizedException("Invalid email or password.");
    }
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password.");
    }
    return this.issueTokens(user.id, user.petOwnerProfile.name, user.email);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { petOwnerProfile: true } } },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.audience !== OWNER_AUDIENCE) {
      throw new UnauthorizedException("Session expired, please sign in again.");
    }
    if (!stored.user.petOwnerProfile || stored.user.status === "SUSPENDED") {
      throw new UnauthorizedException("Session expired, please sign in again.");
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(stored.user.id, stored.user.petOwnerProfile.name, stored.user.email);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(userId: string, name: string, email: string): Promise<AuthTokens> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, aud: OWNER_AUDIENCE, role: "PET_OWNER" },
      { expiresIn: "15m" },
    );

    const refreshToken = generateRefreshTokenValue();
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        audience: OWNER_AUDIENCE,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return { accessToken, refreshToken, user: { id: userId, name, email } };
  }
}
