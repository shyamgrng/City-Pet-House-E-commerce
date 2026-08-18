import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";
import { JwtPayload } from "./jwt.strategy";

@Injectable()
export class CourierJwtStrategy extends PassportStrategy(Strategy, "jwt-courier") {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? "dev-secret-change-me",
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.aud !== "courier" || payload.role !== "COURIER") {
      throw new UnauthorizedException();
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, include: { courierProfile: true } });
    // A pending (unverified) courier can still authenticate — the portal
    // shows a pending-approval state rather than locking them out.
    if (!user || !user.courierProfile || user.status === "SUSPENDED") {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, courierProfileId: user.courierProfile.id };
  }
}
