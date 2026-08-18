import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";
import { JwtPayload } from "./jwt.strategy";

@Injectable()
export class B2BJwtStrategy extends PassportStrategy(Strategy, "jwt-b2b") {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? "dev-secret-change-me",
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.aud !== "b2b" || payload.role !== "B2B_SUPPLIER") {
      throw new UnauthorizedException();
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, include: { b2bProfile: true } });
    // Unlike doctors, a pending (unverified) supplier can still authenticate —
    // the portal shows a pending-approval state rather than being locked out.
    if (!user || !user.b2bProfile || user.status === "SUSPENDED") {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, b2bProfileId: user.b2bProfile.id };
  }
}
