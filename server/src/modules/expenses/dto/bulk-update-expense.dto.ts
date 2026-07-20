import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  ArrayMaxSize,
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  IsDateString,
} from 'class-validator';
import { EXPENSE_CATEGORIES } from '../constants/categories.js';

export class BulkUpdateExpenseItemDto {
  @IsString()
  title: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsIn(EXPENSE_CATEGORIES, {
    message: `category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
  })
  category?: string;

  @IsDateString()
  date: string;
}

export class BulkUpdateExpenseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateExpenseItemDto)
  @ArrayMaxSize(100, { message: 'Cannot update more than 100 expenses at once' })
  expenses: BulkUpdateExpenseItemDto[];
}
