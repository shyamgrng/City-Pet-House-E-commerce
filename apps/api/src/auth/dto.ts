import { IsArray, IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterOwnerDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(7)
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}

export class RegisterB2BDto {
  @IsString() @MinLength(1) companyName!: string;
  @IsString() @MinLength(1) contactName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(7) phone!: string;
  @IsOptional() @IsString() altPhone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) categories?: string[];
  @IsString() @MinLength(8) password!: string;
}

export class RegisterCourierDto {
  @IsString() @MinLength(1) companyName!: string;
  @IsString() @MinLength(1) contactName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(7) phone!: string;
  @IsOptional() @IsString() altPhone?: string;
  @IsOptional() @IsString() address?: string;
  @IsString() @MinLength(8) password!: string;
}
