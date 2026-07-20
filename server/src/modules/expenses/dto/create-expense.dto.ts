import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  MinLength,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EXPENSE_CATEGORIES } from '../constants/categories.js';

const trimString = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CreateExpenseDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @trimString()
  title: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @trimString()
  description?: string;

  @IsOptional()
  @trimString()
  @IsIn(EXPENSE_CATEGORIES, {
    message: `category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
  })
  category?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}
