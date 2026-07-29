import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsMongoId,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateExpenseDto } from './create-expense.dto';

export class BulkUpsertExpenseItemDto extends CreateExpenseDto {
  @IsMongoId()
  @IsOptional()
  _id?: string;
}

export class BulkUpsertExpenseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpsertExpenseItemDto)
  @ArrayMaxSize(100, { message: 'Cannot upsert more than 100 expenses at once' })
  expenses: BulkUpsertExpenseItemDto[];
}
