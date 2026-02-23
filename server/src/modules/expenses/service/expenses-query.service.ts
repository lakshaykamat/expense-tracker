import { Injectable, BadRequestException } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { ExpensesRepository } from '../repository/expenses.repository';
import {
  formatExpenseForExport,
  buildDailySpendingArray,
  buildMonthRanges,
  buildTotalsMap,
} from '../utils/expenses.utils';
import {
  getMonthDateRange,
  getCurrentMonth,
} from '../../../common/utils/date.utils';
import {
  isValidObjectId,
  isValidMonthFormat,
} from '../../../common/utils/validation.utils';

@Injectable()
export class ExpensesQueryService {
  constructor(private readonly repository: ExpensesRepository) {}

  async findAll(
    userId: string,
    month?: string,
    startDateStr?: string,
    endDateStr?: string,
    groupBy?: string,
    limit?: number,
  ) {
    if (!isValidObjectId(userId)) throw new BadRequestException('Invalid user ID format');

    let startDate: Date;
    let endDate: Date;
    let useInclusiveEnd = false;

    if (startDateStr && endDateStr) {
      startDate = new Date(startDateStr + 'T00:00:00.000Z');
      endDate = new Date(endDateStr + 'T23:59:59.999Z');
      useInclusiveEnd = true;
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format. Expected YYYY-MM-DD');
      }
      if (startDate > endDate) {
        throw new BadRequestException('startDate must be before or equal to endDate');
      }
    } else {
      const monthToUse = month || getCurrentMonth();
    if (!monthToUse) {
      return this.repository.findAll(userId, undefined, { limit });
    }
      if (!isValidMonthFormat(monthToUse)) {
        throw new BadRequestException('Invalid month format. Expected YYYY-MM');
      }
      try {
        const range = getMonthDateRange(monthToUse);
        startDate = range.startDate;
        endDate = range.endDate;
      } catch (err: unknown) {
        throw new BadRequestException(
          err instanceof Error ? err.message : 'Invalid month format',
        );
      }
    }

    if (groupBy === 'category' && startDateStr && endDateStr) {
      return this.repository.getCategoryBreakdown(userId, startDate, endDate);
    }

    const dateQuery = useInclusiveEnd
      ? { $gte: startDate, $lte: endDate }
      : { $gte: startDate, $lt: endDate };

    const result = await this.repository.findAll(userId, dateQuery, {
      limit,
    });
    return result;
  }

  async findAllForExport(userId: string): Promise<unknown[]> {
    if (!isValidObjectId(userId)) throw new BadRequestException('Invalid user ID format');
    const expenses = await this.repository.findAllForExport(userId);
    return expenses.map((e) => formatExpenseForExport(e as unknown as Record<string, unknown>));
  }

  async getTotalExpensesForMonth(userId: string, month: string): Promise<number> {
    if (!isValidMonthFormat(month) || !isValidObjectId(userId)) return 0;
    try {
      const { startDate, endDate } = getMonthDateRange(month);
      return this.repository.getTotalForMonth(userId, startDate, endDate);
    } catch {
      return 0;
    }
  }

  async getTotalExpensesForMonths(
    userId: string,
    months: string[],
  ): Promise<Map<string, number>> {
    if (months.length === 0 || !isValidObjectId(userId)) return new Map();
    const validMonths = months.filter((m) => isValidMonthFormat(m));
    if (validMonths.length === 0) return new Map();
    try {
      const monthRanges = buildMonthRanges(validMonths, getMonthDateRange);
      if (monthRanges.length === 0) return new Map();
      const result = await this.repository.getTotalForMonths(userId, monthRanges);
      return buildTotalsMap(result, validMonths);
    } catch {
      return new Map();
    }
  }

  async getDailySpending(
    userId: string,
    month: string,
  ): Promise<Array<{ day: number; spending: number }>> {
    if (!isValidMonthFormat(month) || !isValidObjectId(userId)) return [];
    try {
      const { startDate, endDate } = getMonthDateRange(month);
      const result = await this.repository.getDailySpending(userId, startDate, endDate);
      const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
      const currentMonth = getCurrentMonth();
      const maxDay = month === currentMonth ? new Date().getUTCDate() : daysInMonth;
      return buildDailySpendingArray(result, maxDay);
    } catch {
      return [];
    }
  }

  async getCategoryBreakdown(
    userId: string,
    month: string,
  ): Promise<Array<{ category: string; amount: number }>> {
    if (!isValidMonthFormat(month) || !isValidObjectId(userId)) return [];
    try {
      const { startDate, endDate } = getMonthDateRange(month);
      return this.repository.getCategoryBreakdown(userId, startDate, endDate);
    } catch {
      return [];
    }
  }

  async getTopExpenses(
    userId: string,
    month: string,
    limit = 5,
  ): Promise<Array<{ title: string; amount: number }>> {
    if (!isValidMonthFormat(month) || !isValidObjectId(userId)) return [];
    try {
      const { startDate, endDate } = getMonthDateRange(month);
      return this.repository.getTopExpenses(userId, startDate, endDate, limit);
    } catch {
      return [];
    }
  }

  async getWeeklyExpenses(
    userId: string,
    month: string,
  ): Promise<Array<{ week: number; amount: number; startDate: string; endDate: string }>> {
    if (!isValidMonthFormat(month) || !isValidObjectId(userId)) return [];
    try {
      const { startDate, endDate } = getMonthDateRange(month);
      return this.repository.getWeeklyExpenses(userId, startDate, endDate);
    } catch {
      return [];
    }
  }

  async getAnalysisExpenseStats(
    userId: string,
    month: string,
    session?: ClientSession,
  ): Promise<{
    totalExpenses: number;
    categoryBreakdown: Array<{ category: string; amount: number }>;
    topExpenses: Array<{ title: string; amount: number }>;
    weeklyExpenses: Array<{
      week: number;
      amount: number;
      startDate: string;
      endDate: string;
    }>;
  }> {
    if (!isValidMonthFormat(month) || !isValidObjectId(userId)) {
      return {
        totalExpenses: 0,
        categoryBreakdown: [],
        topExpenses: [],
        weeklyExpenses: [],
      };
    }
    try {
      const { startDate, endDate } = getMonthDateRange(month);
      return this.repository.getAnalysisExpenseStats(
        userId,
        startDate,
        endDate,
        session,
      );
    } catch {
      return {
        totalExpenses: 0,
        categoryBreakdown: [],
        topExpenses: [],
        weeklyExpenses: [],
      };
    }
  }
}
