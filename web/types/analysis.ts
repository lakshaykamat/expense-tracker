import type { Budget } from './budget';

export interface CategoryBreakdown {
  category: string;
  amount: number;
}

export interface DailySpending {
  day: number;
  spending: number;
}

export interface TopExpenseItem {
  title: string;
  amount: number;
}

export interface WeeklyExpense {
  week: number;
  amount: number;
  startDate: string;
  endDate: string;
}

export interface AnalysisStats {
  budget?: Budget;
  totalBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  budgetUsedPercentage: number;
  budgetExists: boolean;
  dailyAverageSpend: number;
  topCategories: CategoryBreakdown[];
  topExpenses: TopExpenseItem[];
  weeklyExpenses: WeeklyExpense[];
}
