import { IsBoolean } from "class-validator";

export class SetDoctorOnlineDto {
  @IsBoolean() online!: boolean;
}
