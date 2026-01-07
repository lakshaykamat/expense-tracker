/**
 * Budget utility functions
 * Helper functions for calculations and data transformations
 */

import { getCurrentMonth } from '../../../common/utils/date.utils';

export function calculateDaysForAverage(month: string): number {
  const [year, monthNum] = month.split('-');
  const yearNum = parseInt(year, 10);
  const monthNumber = parseInt(monthNum, 10);
  const daysInMonth = new Date(yearNum, monthNumber, 0).getDate();

  const currentMonth = getCurrentMonth();
  if (month === currentMonth) {
    const today = new Date();
    const currentDay = today.getDate();
    return currentDay > 0 ? currentDay : 1;
  }

  return daysInMonth;
}

export function calculateDailyAverage(totalExpenses: number, days: number): number {
  return days > 0 ? totalExpenses / days : 0;
}

export function calculateBudgetUsedPercentage(
  totalExpenses: number,
  totalBudget: number,
): number {
  return totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
}

export function calculateRemainingBudget(
  totalBudget: number,
  totalExpenses: number,
): number {
  return totalBudget - totalExpenses;
}

export function formatBudgetForExport(budget: any): any {
  return {
    _id: budget._id.toString(),
    month: budget.month,
    essentialItems: JSON.stringify(budget.essentialItems || []),
    totalBudget: budget.totalBudget || 0,
    userId: budget.userId.toString(),
    createdAt: budget.createdAt
      ? new Date(budget.createdAt).toISOString().split('T')[0]
      : '',
    updatedAt: budget.updatedAt
      ? new Date(budget.updatedAt).toISOString().split('T')[0]
      : '',
  };
}

export function validateEssentialItem(item: {
  name?: string;
  amount?: number;
}): void {
  if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
    throw new Error('Item name is required');
  }

  if (
    item.amount !== undefined &&
    (item.amount < 0 || !isFinite(item.amount))
  ) {
    throw new Error('Item amount must be a valid positive number');
  }
}

