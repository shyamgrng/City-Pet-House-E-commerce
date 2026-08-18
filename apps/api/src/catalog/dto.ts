import { IsArray, IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class CreateAdoptionPostDto {
  @IsString() @MinLength(1) name!: string;
  @IsString() @MinLength(1) breed!: string;
  @IsString() @MinLength(1) age!: string;
  @IsString() @MinLength(1) sex!: string;
  @IsOptional() @IsString() vaccinationStatus?: string;
  @IsString() @MinLength(1) address!: string;
  @IsString() @MinLength(1) description!: string;
  @IsString() @MinLength(1) contact!: string;
  @IsOptional() @IsArray() @IsString({ each: true }) photos?: string[];
}

export class UpdateOwnAdoptionStatusDto {
  @IsIn(["ACTIVE", "ADOPTED", "REMOVED"]) status!: "ACTIVE" | "ADOPTED" | "REMOVED";
}
