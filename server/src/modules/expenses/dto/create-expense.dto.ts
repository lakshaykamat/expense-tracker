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

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @trimString()
  category?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}
