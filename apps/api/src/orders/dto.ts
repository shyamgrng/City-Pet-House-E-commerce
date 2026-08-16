import { IsIn, IsString, MinLength } from "class-validator";

export class CreateOrderDto {
  @IsString()
  @MinLength(1)
  addressId!: string;

  @IsIn(["FONEPAY", "BANK_TRANSFER"])
  paymentMethod!: "FONEPAY" | "BANK_TRANSFER";

  @IsString()
  @MinLength(1)
  paymentReceiptUrl!: string;
}
