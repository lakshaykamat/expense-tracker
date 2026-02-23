import { Type } from 'class-transformer';
import { IsArray, ValidateNested, ArrayMaxSize } from 'class-validator';
import { CreateExpenseDto } from './create-expense.dto';

export class BulkCreateExpenseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseDto)
  @ArrayMaxSize(100, { message: 'Cannot create more than 100 expenses at once' })
  expenses: CreateExpenseDto[];
}
