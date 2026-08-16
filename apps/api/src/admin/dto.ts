import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

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
}
