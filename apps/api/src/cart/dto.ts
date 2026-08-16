import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class AddCartItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  qty!: number;

  @IsOptional()
  @IsString()
  deviceKey?: string;
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(0)
  qty!: number;

  @IsOptional()
  @IsString()
  deviceKey?: string;
}
