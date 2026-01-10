import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  Min,
  MinLength,
  MaxLength,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const trimString = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class EssentialItemDto {
  @IsString({ message: 'Item name must be a string' })
  @MinLength(3, { message: 'Item name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Item name must be at most 100 characters long' })
  @trimString()
  name: string;

  @IsNumber({}, { message: 'Item amount must be a number' })
  @Min(0.01, { message: 'Item amount must be at least ₹0.01' })
  @IsOptional()
  amount?: number;
}

export class CreateBudgetDto {
  @IsString({ message: 'Month must be a string' })
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'Month must be in format YYYY-MM (e.g., 2026-01)',
  })
  month: string;

  @IsArray({ message: 'Essential items must be an array' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EssentialItemDto)
  essentialItems?: EssentialItemDto[];
}
