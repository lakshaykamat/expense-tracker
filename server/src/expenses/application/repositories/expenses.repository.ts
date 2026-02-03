/**
 * Expense repository
 * Database layer for expense operations
 */

import { ClientSession, Model } from 'mongoose';
import { ExpenseDocument } from '../../domain/schemas/expense.schema';
import {
  buildUserIdQuery,
  toObjectId,
  toObjectIds,
  buildIdAndUserIdQuery,
} from '../../../common/utils/query.utils';
import {
  getTotalExpensesForMonthPipeline,
  getTotalExpensesForMonthsPipeline,
  getDailySpendingPipeline,
  getCategoryBreakdownPipeline,
  getAnalysisExpenseStatsPipeline,
} from '../aggregations/expenses.aggregations';

export class ExpensesRepository {
  constructor(private expenseModel: Model<ExpenseDocument>) {}

  async create(data: {
    userId: string;
    title: string;
    amount: number;
    description?: string;
    category?: string;
    date: Date;
  }) {
    const expense = new this.expenseModel({
      ...data,
      userId: toObjectId(data.userId),
    });
    return expense.save();
  }

  async bulkCreate(expenses: any[]) {
    return this.expenseModel.insertMany(expenses);
  }

  async findAll(userId: string, dateQuery?: any) {
    const userIdQuery = buildUserIdQuery(userId);
    const query: any = { ...userIdQuery };

    if (dateQuery) {
      query.date = dateQuery;
    }

    return this.expenseModel
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();
  }

  async findAllForExport(userId: string) {
    const userIdQuery = buildUserIdQuery(userId);
    return this.expenseModel
      .find(userIdQuery)
      .sort({ date: -1, createdAt: -1 })
      .lean();
  }

  async findById(id: string, userId: string) {
    const query = buildIdAndUserIdQuery(id, userId);
    return this.expenseModel.findOne(query);
  }

  async update(id: string, userId: string, updateData: any) {
    const query = buildIdAndUserIdQuery(id, userId);
    return this.expenseModel.findOneAndUpdate(query, updateData, { new: true });
  }

  async delete(id: string, userId: string) {
    const query = buildIdAndUserIdQuery(id, userId);
    const result = await this.expenseModel.deleteOne(query);
    return result.deletedCount > 0;
  }

  async bulkDelete(ids: string[], userId: string) {
    const userIdQuery = buildUserIdQuery(userId);
    const query = {
      _id: { $in: toObjectIds(ids) },
      ...userIdQuery,
    };
    const result = await this.expenseModel.deleteMany(query);
    return result.deletedCount;
  }

  async deleteByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ deletedCount: number }> {
    const userIdQuery = buildUserIdQuery(userId);
    const result = await this.expenseModel.deleteMany({
      ...userIdQuery,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });
    return { deletedCount: result.deletedCount };
  }

  async getTotalForMonth(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const userIdQuery = buildUserIdQuery(userId);
    const result = await this.expenseModel
      .aggregate(
        getTotalExpensesForMonthPipeline(userIdQuery, startDate, endDate),
      )
      .exec();

    return result.length > 0 &&
      result[0].total !== null &&
      result[0].total !== undefined
      ? Number(result[0].total)
      : 0;
  }

  async getTotalForMonths(
    userId: string,
    monthRanges: Array<{ month: string; startDate: Date; endDate: Date }>,
  ): Promise<Array<{ _id: string; total: number }>> {
    const userIdQuery = buildUserIdQuery(userId);
    return this.expenseModel
      .aggregate(getTotalExpensesForMonthsPipeline(userIdQuery, monthRanges))
      .allowDiskUse(true)
      .exec();
  }

  async getDailySpending(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ day: number; spending: number }>> {
    const userIdQuery = buildUserIdQuery(userId);
    return this.expenseModel
      .aggregate(getDailySpendingPipeline(userIdQuery, startDate, endDate))
      .exec();
  }

  async getCategoryBreakdown(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ category: string; amount: number }>> {
    const userIdQuery = buildUserIdQuery(userId);
    const result = await this.expenseModel
      .aggregate(getCategoryBreakdownPipeline(userIdQuery, startDate, endDate))
      .exec();

    return result.map((item) => ({
      category: item.category,
      amount: Number(item.amount) || 0,
    }));
  }

  async getAnalysisExpenseStats(
    userId: string,
    startDate: Date,
    endDate: Date,
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
    const userIdQuery = buildUserIdQuery(userId);
    const agg = this.expenseModel.aggregate(
      getAnalysisExpenseStatsPipeline(userIdQuery, startDate, endDate),
    );
    if (session) agg.session(session);
    const result = await agg.exec();

    const doc = result[0];
    const totalArr = doc?.total ?? [];
    const totalExpenses =
      totalArr[0]?.total !== null && totalArr[0]?.total !== undefined
        ? Number(totalArr[0].total)
        : 0;

    const categoryBreakdown = (doc?.categoryBreakdown ?? []).map(
      (item: any) => ({
        category: item.category,
        amount: Number(item.amount) || 0,
      }),
    );

    const topExpenses = (doc?.topExpenses ?? []).map((item: any) => ({
      title: String(item.title || '').trim(),
      amount: Number(item.amount) || 0,
    }));

    const weeklyAmounts = (doc?.weekly ?? []).map((item: any) => ({
      week: Number(item.week),
      amount: Number(item.amount) || 0,
    }));
    const weeklyMap = new Map(
      weeklyAmounts.map((w) => [w.week, w.amount]),
    );
    const weeksInMonth = this.getWeeksInMonthWithDates(startDate, endDate);
    const weeklyExpenses = weeksInMonth
      .map((weekInfo) => ({
        week: weekInfo.week,
        amount: weeklyMap.get(weekInfo.week) || 0,
        startDate: weekInfo.startDate,
        endDate: weekInfo.endDate,
      }))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    return {
      totalExpenses,
      categoryBreakdown,
      topExpenses,
      weeklyExpenses,
    };
  }

  async getTopExpenses(
    userId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 5,
  ): Promise<Array<{ title: string; amount: number }>> {
    const userIdQuery = buildUserIdQuery(userId);

    // Group expenses by title and sum their amounts
    const groupedExpenses = await this.expenseModel
      .aggregate([
        {
          $match: {
            ...userIdQuery,
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $addFields: {
            trimmedTitle: { $trim: { input: '$title' } },
          },
        },
        {
          $group: {
            _id: '$trimmedTitle',
            amount: { $sum: '$amount' },
          },
        },
        {
          $sort: { amount: -1 },
        },
        {
          $limit: limit,
        },
        {
          $project: {
            _id: 0,
            title: '$_id',
            amount: 1,
          },
        },
      ])
      .exec();

    return groupedExpenses.map((expense) => ({
      title: expense.title.trim(),
      amount: Number(expense.amount) || 0,
    }));
  }

  async getWeeklyExpenses(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{ week: number; amount: number; startDate: string; endDate: string }>
  > {
    const userIdQuery = buildUserIdQuery(userId);

    // Group expenses by actual calendar weeks using ISO week numbers (Monday-based)
    const weeklyExpenses = await this.expenseModel
      .aggregate([
        {
          $match: {
            ...userIdQuery,
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $addFields: {
            isoWeek: { $isoWeek: '$date' },
          },
        },
        {
          $group: {
            _id: '$isoWeek',
            amount: { $sum: '$amount' },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            _id: 0,
            week: '$_id',
            amount: 1,
          },
        },
      ])
      .exec();

    // Get all weeks that occur in the month with date ranges
    const weeksInMonth = this.getWeeksInMonthWithDates(startDate, endDate);
    const expenseMap = new Map(
      weeklyExpenses.map((item) => [Number(item.week), Number(item.amount)]),
    );

    // Return all weeks in the month with amounts (0 if no expenses) and date ranges
    // Sort by start date instead of week number to handle year boundaries correctly
    return weeksInMonth
      .map((weekInfo) => ({
        week: weekInfo.week,
        amount: expenseMap.get(weekInfo.week) || 0,
        startDate: weekInfo.startDate,
        endDate: weekInfo.endDate,
      }))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  private getWeeksInMonthWithDates(
    startDate: Date,
    endDate: Date,
  ): Array<{ week: number; startDate: string; endDate: string }> {
    const weekMap = new Map<
      number,
      { week: number; startDate: Date; endDate: Date }
    >();
    const current = new Date(startDate);

    while (current <= endDate) {
      const isoWeek = this.getISOWeekNumber(current);
      if (!weekMap.has(isoWeek)) {
        // Get Monday (start) and Sunday (end) of this ISO week
        const monday = this.getMondayOfWeek(current);
        const sunday = this.getSundayOfWeek(current);
        weekMap.set(isoWeek, {
          week: isoWeek,
          startDate: monday,
          endDate: sunday,
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return Array.from(weekMap.values())
      .map((item) => ({
        week: item.week,
        startDate: item.startDate.toISOString().split('T')[0],
        endDate: item.endDate.toISOString().split('T')[0],
      }))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  private getMondayOfWeek(date: Date): Date {
    const d = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  }

  private getSundayOfWeek(date: Date): Date {
    const monday = this.getMondayOfWeek(date);
    const sunday = new Date(monday);
    sunday.setUTCDate(sunday.getUTCDate() + 6);
    return sunday;
  }

  private getISOWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
