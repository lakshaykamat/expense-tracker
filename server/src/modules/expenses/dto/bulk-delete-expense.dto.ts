import { IsArray, ArrayMaxSize, IsMongoId } from 'class-validator';

export class BulkDeleteExpenseDto {
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMaxSize(100, { message: 'Cannot delete more than 100 expenses at once' })
  ids: string[];
}
