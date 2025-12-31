import { IsString, IsArray, IsOptional } from 'class-validator';

export interface EssentialItemDto {
  name: string;
  amount?: number;
}

export class CreateBudgetDto {
  @IsString()
  month: string; // Format: "YYYY-MM"

  @IsArray()
  @IsOptional()
  essentialItems?: EssentialItemDto[];
}
