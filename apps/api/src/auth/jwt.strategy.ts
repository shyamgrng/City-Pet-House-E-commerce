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
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { petOwnerProfile: true },
    });
    if (!user || !user.petOwnerProfile || user.status === "SUSPENDED") {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, ownerProfileId: user.petOwnerProfile.id, role: payload.role };
  }
}
