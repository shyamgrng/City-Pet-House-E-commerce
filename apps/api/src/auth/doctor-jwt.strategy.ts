import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";
import { JwtPayload } from "./jwt.strategy";

@Injectable()
export class DoctorJwtStrategy extends PassportStrategy(Strategy, "jwt-doctor") {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? "dev-secret-change-me",
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.aud !== "doctor" || payload.role !== "DOCTOR") {
      throw new UnauthorizedException();
    }
    const profile = await this.prisma.doctorProfile.findUnique({ where: { userId: payload.sub } });
    if (!profile || !profile.verified) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, doctorProfileId: profile.id };
  }
}
