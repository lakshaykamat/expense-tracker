import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  ArrayMaxSize,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
} from 'class-validator';

export class BulkUpdateExpenseItemDto {
  @IsString()
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
