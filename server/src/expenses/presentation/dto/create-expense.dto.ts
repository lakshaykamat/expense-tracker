import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MinLength,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

const trimString = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CreateExpenseDto {
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(100, { message: 'Title must be at most 100 characters long' })
  @trimString()
  title: string;

  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be at least ₹0.01' })
  amount: number;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(500, {
    message: 'Description must be at most 500 characters long',
  })
  @trimString()
  description?: string;

  @IsString({ message: 'Category must be a string' })
  @IsOptional()
  @MaxLength(50, { message: 'Category must be at most 50 characters long' })
  @trimString()
  category?: string;

  @IsDateString({}, { message: 'Date must be a valid date string' })
  date: string;
}
