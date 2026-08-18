import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDoctorDto, UpdateDoctorDto } from "./dto";

@Injectable()
export class AdminDoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const users = await this.prisma.user.findMany({
      where: { role: "DOCTOR" },
      include: { doctorProfile: true },
      orderBy: { createdAt: "asc" },
    });
    return users.filter((u) => u.doctorProfile).map(this.toDto);
  }

  async create(dto: CreateDoctorDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("An account with this email already exists.");

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: "DOCTOR",
        doctorProfile: {
          create: {
            displayName: dto.displayName,
            qualification: dto.qualification,
            licenseNo: dto.licenseNo,
            address: dto.address,
            consultFee: dto.consultFee,
            verified: true, // admin-provisioned accounts don't need a separate approval step
          },
        },
      },
      include: { doctorProfile: true },
    });
    return this.toDto(user);
  }

  async update(userId: string, dto: UpdateDoctorDto) {
    const user = await this.getOrThrow(userId);

    if (dto.status) {
      await this.prisma.user.update({ where: { id: userId }, data: { status: dto.status } });
    }
    const { status: _status, ...profileFields } = dto;
    if (Object.keys(profileFields).length > 0) {
      await this.prisma.doctorProfile.update({ where: { id: user.doctorProfile!.id }, data: profileFields });
    }

    return this.list().then((all) => all.find((d) => d.id === userId));
  }

  private async getOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { doctorProfile: true } });
    if (!user || user.role !== "DOCTOR" || !user.doctorProfile) {
      throw new NotFoundException("Doctor account not found.");
    }
    return user;
  }

  private toDto(user: {
    id: string;
    email: string;
    status: string;
    doctorProfile: {
      displayName: string;
      qualification: string | null;
      licenseNo: string | null;
      address: string | null;
      consultFee: number;
      isOnline: boolean;
      verified: boolean;
    } | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      displayName: user.doctorProfile!.displayName,
      qualification: user.doctorProfile!.qualification,
      licenseNo: user.doctorProfile!.licenseNo,
      address: user.doctorProfile!.address,
      consultFee: user.doctorProfile!.consultFee,
      isOnline: user.doctorProfile!.isOnline,
      verified: user.doctorProfile!.verified,
    };
  }
}
