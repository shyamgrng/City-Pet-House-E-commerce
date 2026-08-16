import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";

export interface JwtPayload {
  sub: string;
  aud: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt-owner") {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? "dev-secret-change-me",
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.aud !== "owner" || payload.role !== "PET_OWNER") {
      throw new UnauthorizedException();
    }
    const profile = await this.prisma.petOwnerProfile.findUnique({
      where: { userId: payload.sub },
    });
    if (!profile) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, ownerProfileId: profile.id, role: payload.role };
  }
}
