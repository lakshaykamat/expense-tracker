import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  Min,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EssentialItemDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;
}

export class CreateBudgetDto {
  @IsString()
  month: string; // Format: "YYYY-MM"

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EssentialItemDto)
  essentialItems?: EssentialItemDto[];
}
