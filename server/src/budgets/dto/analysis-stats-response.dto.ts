import { BudgetResponseDto } from './budget-response.dto';

export class AnalysisStatsResponseDto {
  budget: BudgetResponseDto;
  totalExpenses: number;
  totalBudget: number;
  remainingBudget: number;
  budgetUsedPercentage: number;
}

