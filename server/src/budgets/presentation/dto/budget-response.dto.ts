import { EssentialItem } from '../../domain/schemas/budget.schema';

export class BudgetResponseDto {
  _id: string;
  month: string;
  essentialItems: EssentialItem[];
  totalBudget: number;
  spentAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

