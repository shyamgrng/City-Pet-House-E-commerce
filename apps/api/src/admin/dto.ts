import { IsArray, IsBoolean, IsEmail, IsIn, IsInt, IsNumber, IsObject, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

export class RejectPaymentDto {
  @IsString()
  @MinLength(1)
  reason!: string;
}

export class CancelOrderDto {
  @IsString()
  @MinLength(1)
  reason!: string;
}

export class ToggleChecklistDto {
  @IsBoolean()
  checked!: boolean;
}

export class UpsertProductDto {
  @IsString() @MinLength(1) name!: string;
  @IsOptional() @IsString() description?: string;
  @IsString() @MinLength(1) category!: string;
  @IsOptional() @IsString() brand?: string;
  @IsInt() @Min(0) price!: number;
  @IsOptional() @IsInt() @Min(0) qty?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsIn(["ACTIVE", "HIDDEN"]) status?: string;
  @IsOptional() @IsString() badge?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(5) rating?: number;
}

export class CreateAdminUserDto {
  @IsString() @MinLength(1) name!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
  @IsIn(["Admin", "Manager", "Staff"]) role!: string;
  @IsObject() permissions!: Record<string, boolean>;
}

export class UpdateAdminUserDto {
  @IsOptional() @IsString() @MinLength(1) name?: string;
  @IsOptional() @IsIn(["Admin", "Manager", "Staff"]) role?: string;
  @IsOptional() @IsObject() permissions?: Record<string, boolean>;
  @IsOptional() @IsIn(["ACTIVE", "SUSPENDED"]) status?: "ACTIVE" | "SUSPENDED";
}
