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

export class UpsertServiceDto {
  @IsString() @MinLength(1) name!: string;
  @IsString() @MinLength(1) shortDesc!: string;
  @IsString() @MinLength(1) seoTitle!: string;
  @IsString() @MinLength(1) longDesc!: string;
  @IsOptional() @IsArray() @IsString({ each: true }) benefits?: string[];
  @IsOptional() @IsString() duration?: string;
  @IsOptional() @IsString() price?: string;
  @IsOptional() @IsArray() schedule?: { age: string; vaccine: string }[];
  @IsOptional() @IsString() photo?: string;
  @IsOptional() @IsIn(["ACTIVE", "HIDDEN"]) status?: string;
  @IsOptional() @IsInt() order?: number;
}

export class UpsertPetListingDto {
  @IsString() @MinLength(1) breed!: string;
  @IsIn(["Dog", "Cat", "Small Pets", "Birds", "Fish"]) species!: string;
  @IsString() @MinLength(1) sex!: string;
  @IsString() @MinLength(1) age!: string;
  @IsInt() @Min(0) price!: number;
  @IsOptional() @IsInt() @Min(0) deliveryFee?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) videos?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsNumber() @Min(0) @Max(5) rating?: number;
  @IsOptional() @IsIn(["AVAILABLE", "RESERVED", "SOLD"]) status?: "AVAILABLE" | "RESERVED" | "SOLD";
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
