import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class UpsertAddressDto {
  @IsString() @MinLength(1) label!: string;
  @IsString() @MinLength(1) address!: string;
  @IsString() @MinLength(1) phone!: string;
  @IsOptional() @IsString() altPhone?: string;
  @IsOptional() @IsString() mapLink?: string;
  @IsOptional() @IsBoolean() isPrimary?: boolean;
}

export class UpdateProfileDto {
  @IsOptional() @IsString() @MinLength(1) name?: string;
  @IsOptional() @IsString() phone?: string;
}
