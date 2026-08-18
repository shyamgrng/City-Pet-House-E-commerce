import { IsBoolean, IsISO8601, IsOptional, IsString, MinLength } from "class-validator";

export class CreateVetBookingDto {
  @IsString() @MinLength(1) doctorId!: string;
  @IsString() @MinLength(1) petName!: string;
  @IsString() @MinLength(1) species!: string;
  @IsOptional() @IsString() breed?: string;
  @IsOptional() @IsString() age?: string;
  @IsString() @MinLength(1) reason!: string;
  @IsISO8601() scheduledAt!: string;
  @IsBoolean() isOnline!: boolean;
  @IsString() @MinLength(1) paymentReceiptUrl!: string;
}
