import { IsString, IsNumber, IsOptional, Min, MinLength, MaxLength } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  date: string;
}
