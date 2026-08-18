import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { generateRefreshTokenValue, hashToken } from "./token.util";
import { LoginDto } from "./dto";

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const DOCTOR_AUDIENCE = "doctor";

export interface DoctorAuthTokens {
  accessToken: string;
  refreshToken: string;
  doctor: {
    id: string;
    displayName: string;
    email: string;
    qualification: string | null;
    consultFee: number;
    isOnline: boolean;
  };
}

/**
 * No self-registration yet — doctor accounts are provisioned by admin (or
 * seeded), same as admin/staff. A doctor must be `verified` to sign in;
 * this is the gate the future "Pending Registrations" approval flow will
 * flip once self-registration ships.
 */
@Injectable()
export class DoctorAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<DoctorAuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { doctorProfile: true },
    });
    if (!user || user.role !== "DOCTOR" || !user.doctorProfile || !user.doctorProfile.verified || user.status !== "ACTIVE") {
      throw new UnauthorizedException("Invalid email or password.");
    }
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password.");
    }
    return this.issueTokens(user.id, user.email, user.doctorProfile);
  }

  async refresh(refreshToken: string): Promise<DoctorAuthTokens> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { doctorProfile: true } } },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.audience !== DOCTOR_AUDIENCE) {
      throw new UnauthorizedException("Session expired, please sign in again.");
    }
    if (!stored.user.doctorProfile || stored.user.status !== "ACTIVE") {
      throw new UnauthorizedException("Session expired, please sign in again.");
    }

    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

    return this.issueTokens(stored.user.id, stored.user.email, stored.user.doctorProfile);
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
    email: string,
    profile: { id: string; displayName: string; qualification: string | null; consultFee: number; isOnline: boolean },
  ): Promise<DoctorAuthTokens> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, aud: DOCTOR_AUDIENCE, role: "DOCTOR" },
      { expiresIn: "15m" },
    );

    const refreshToken = generateRefreshTokenValue();
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        audience: DOCTOR_AUDIENCE,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return {
      accessToken,
      refreshToken,
      doctor: {
        id: profile.id,
        displayName: profile.displayName,
        email,
        qualification: profile.qualification,
        consultFee: profile.consultFee,
        isOnline: profile.isOnline,
      },
    };
  }
}
