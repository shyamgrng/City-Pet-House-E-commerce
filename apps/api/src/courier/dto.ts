import { IsString, MinLength } from "class-validator";

export class CancelAssignmentDto {
  @IsString()
  @MinLength(1)
  reason!: string;
}
