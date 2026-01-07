/**
 * Expense utility functions
 * Helper functions for calculations and data transformations
 */

import { normalizeDateToUTC } from '../common/utils/date.utils';
import { isValidMonthFormat } from '../common/utils/validation.utils';

export function formatExpenseForExport(expense: any): any {
  return {
    _id: expense._id.toString(),
    title: expense.title,
    amount: expense.amount,
    description: expense.description || '',
    category: expense.category || '',
    date: expense.date
      ? new Date(expense.date).toISOString().split('T')[0]
      : '',
    createdAt: expense.createdAt
      ? new Date(expense.createdAt).toISOString().split('T')[0]
      : '',
    updatedAt: expense.updatedAt
      ? new Date(expense.updatedAt).toISOString().split('T')[0]
      : '',
  };
}

export function prepareExpenseForCreate(
  dto: any,
  userId: string,
  userIdObj: any,
): any {
  return {
    ...dto,
    userId: userIdObj,
    date: dto.date ? normalizeDateToUTC(dto.date) : new Date(),
  };
}

export function prepareExpenseForUpdate(dto: any): any {
  const updateData: any = { ...dto };
  if (dto.date) {
    const date = normalizeDateToUTC(dto.date);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    updateData.date = date;
  }
  return updateData;
}

export function buildDailySpendingArray(
  result: Array<{ day: number; spending: number }>,
  maxDay: number,
): Array<{ day: number; spending: number }> {
  const dailySpending: Array<{ day: number; spending: number }> = Array.from(
    { length: maxDay },
    (_, index) => ({
      day: index + 1,
      spending: 0,
    }),
  );

  for (const item of result) {
    if (item.day >= 1 && item.day <= maxDay) {
      dailySpending[item.day - 1].spending = Number(item.spending) || 0;
    }
  }

  return dailySpending;
}

export function extractUniqueMonths(
  expenses: Array<{ date?: string }>,
): string[] {
  const months = expenses
    .map((expense) => expense.date?.substring(0, 7))
    .filter(
      (month): month is string =>
        month !== undefined && isValidMonthFormat(month),
    );
  return [...new Set(months)];
}

export function buildMonthRanges(
  months: string[],
  getMonthDateRangeFn: (month: string) => { startDate: Date; endDate: Date },
): Array<{ month: string; startDate: Date; endDate: Date }> {
  return months
    .map((month) => {
      try {
        const range = getMonthDateRangeFn(month);
        return {
          month,
          startDate: range.startDate,
          endDate: range.endDate,
        };
      } catch {
        return null;
      }
    })
    .filter(
      (range): range is { month: string; startDate: Date; endDate: Date } =>
        range !== null,
    );
}

export function buildTotalsMap(
  result: Array<{ _id: string; total: number }>,
  validMonths: string[],
): Map<string, number> {
  const totalsMap = new Map<string, number>();
  const resultMap = new Map<string, number>();

  result.forEach((item) => {
    resultMap.set(item._id, Number(item.total) || 0);
  });

  validMonths.forEach((month) => {
    totalsMap.set(month, resultMap.get(month) || 0);
  });

  return totalsMap;
}
