import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";
import { JwtPayload } from "./jwt.strategy";

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, "jwt-admin") {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? "dev-secret-change-me",
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.aud !== "admin" || payload.role !== "ADMIN_STAFF") {
      throw new UnauthorizedException();
    }
    const profile = await this.prisma.adminStaffProfile.findUnique({
      where: { userId: payload.sub },
      include: { permissions: true },
    });
    if (!profile) {
      throw new UnauthorizedException();
    }
    return {
      userId: payload.sub,
      adminProfileId: profile.id,
      staffRole: profile.role,
      permissions: Object.fromEntries(profile.permissions.map((p) => [p.section, p.granted])),
    };
  }
}
