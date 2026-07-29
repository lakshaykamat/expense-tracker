import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Expense, ExpenseDocument } from '../entities/expense.schema';
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
} from './expenses.aggregations';

const MAX_PAGE_SIZE = 100;

export interface FindAllOptions {
  limit?: number;
}

@Injectable()
export class ExpensesRepository {
  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>,
  ) {}

  async create(data: {
    userId: string;
    title: string;
    amount: number;
    description?: string;
    category?: string;
    date: Date;
  }) {
    const doc = new this.expenseModel({
      ...data,
      userId: toObjectId(data.userId),
    });
    return doc.save();
  }

  async bulkCreate(expenses: unknown[]) {
    return this.expenseModel.insertMany(expenses);
  }

  async findAll(
    userId: string,
    dateQuery?: unknown,
    options?: FindAllOptions,
  ): Promise<unknown[]> {
    const userIdQuery = buildUserIdQuery(userId);
    const query: Record<string, unknown> = { ...userIdQuery };
    if (dateQuery && typeof dateQuery === 'object') query.date = dateQuery;

    const limit =
      options?.limit != null && options.limit > 0
        ? Math.min(options.limit, MAX_PAGE_SIZE)
        : undefined;

    const q = this.expenseModel
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();
    if (limit != null) q.limit(limit);
    return q.exec();
  }

  async findAllForExport(userId: string) {
    const userIdQuery = buildUserIdQuery(userId);
    return this.expenseModel
      .find(userIdQuery)
      .sort({ date: -1, createdAt: -1 })
      .lean()
      .exec();
  }

  async findById(id: string, userId: string) {
    const query = buildIdAndUserIdQuery(id, userId);
    return this.expenseModel.findOne(query).lean().exec();
  }

  async findByIds(ids: string[], userId: string) {
    const userIdQuery = buildUserIdQuery(userId);
    return this.expenseModel
      .find({ _id: { $in: toObjectIds(ids) }, ...userIdQuery })
      .lean()
      .exec();
  }

  async update(id: string, userId: string, updateData: Record<string, unknown>) {
    const query = buildIdAndUserIdQuery(id, userId);
    return this.expenseModel
      .findOneAndUpdate(query, updateData as any, { new: true })
      .lean()
      .exec();
  }

  async delete(id: string, userId: string) {
    const query = buildIdAndUserIdQuery(id, userId);
    const result = await this.expenseModel.deleteOne(query).exec();
    return result.deletedCount > 0;
  }

  async bulkDelete(ids: string[], userId: string) {
    const userIdQuery = buildUserIdQuery(userId);
    const result = await this.expenseModel
      .deleteMany({ _id: { $in: toObjectIds(ids) }, ...userIdQuery })
      .exec();
    return result.deletedCount;
  }

  async deleteByDateRange(userId: string, startDate: Date, endDate: Date) {
    const userIdQuery = buildUserIdQuery(userId);
    const result = await this.expenseModel
      .deleteMany({
        ...userIdQuery,
        date: { $gte: startDate, $lt: endDate },
      })
      .exec();
    return { deletedCount: result.deletedCount };
  }

  async getTotalForMonth(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const userIdQuery = buildUserIdQuery(userId);
    const result = await this.expenseModel
      .aggregate(getTotalExpensesForMonthPipeline(userIdQuery, startDate, endDate))
      .exec();
    const total = result[0]?.total;
    return total != null ? Number(total) : 0;
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
    return result.map((item: { category: string; amount: unknown }) => ({
      category: item.category,
      amount: Number(item.amount) || 0,
    }));
  }

  async getTopExpenses(
    userId: string,
    startDate: Date,
    endDate: Date,
    limit = 5,
  ): Promise<Array<{ title: string; amount: number }>> {
    const userIdQuery = buildUserIdQuery(userId);
    const grouped = await this.expenseModel
      .aggregate([
        { $match: { ...userIdQuery, date: { $gte: startDate, $lt: endDate } } },
        { $addFields: { trimmedTitle: { $trim: { input: '$title' } } } },
        { $group: { _id: '$trimmedTitle', amount: { $sum: '$amount' } } },
        { $sort: { amount: -1 } },
        { $limit: limit },
        { $project: { _id: 0, title: '$_id', amount: 1 } },
      ])
      .exec();
    return grouped.map((e: { title: string; amount: unknown }) => ({
      title: String(e.title || '').trim(),
      amount: Number(e.amount) || 0,
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
    const weekly = await this.expenseModel
      .aggregate([
        { $match: { ...userIdQuery, date: { $gte: startDate, $lt: endDate } } },
        { $addFields: { isoWeek: { $isoWeek: '$date' } } },
        { $group: { _id: '$isoWeek', amount: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, week: '$_id', amount: 1 } },
      ])
      .exec();
    const weeksInMonth = this.getWeeksInMonthWithDates(startDate, endDate);
    const amountMap = new Map(
      weekly.map((item: { week: number; amount: unknown }) => [
        Number(item.week),
        Number(item.amount) || 0,
      ]),
    );
    return weeksInMonth
      .map((w) => ({
        week: w.week,
        amount: amountMap.get(w.week) || 0,
        startDate: w.startDate,
        endDate: w.endDate,
      }))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
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
    weeklyExpenses: Array<{ week: number; amount: number; startDate: string; endDate: string }>;
  }> {
    const userIdQuery = buildUserIdQuery(userId);
    const agg = this.expenseModel.aggregate(
      getAnalysisExpenseStatsPipeline(userIdQuery, startDate, endDate),
    );
    if (session) agg.session(session);
    const result = await agg.exec();
    const doc = result[0];
    const weeksInMonth = this.getWeeksInMonthWithDates(startDate, endDate);
    if (!doc) {
      return {
        totalExpenses: 0,
        categoryBreakdown: [],
        topExpenses: [],
        weeklyExpenses: weeksInMonth.map((w) => ({
          week: w.week,
          amount: 0,
          startDate: w.startDate,
          endDate: w.endDate,
        })),
      };
    }
    const totalArr = doc?.total ?? [];
    const totalExpenses =
      totalArr[0]?.total != null ? Number(totalArr[0].total) : 0;
    const categoryBreakdown = (doc?.categoryBreakdown ?? []).map((item: { category: string; amount: unknown }) => ({
      category: item.category,
      amount: Number(item.amount) || 0,
    }));
    const topExpenses = (doc?.topExpenses ?? []).map((item: { title: string; amount: unknown }) => ({
      title: String(item.title || '').trim(),
      amount: Number(item.amount) || 0,
    }));
    const weeklyMap = new Map<number, number>(
      (doc?.weekly ?? []).map((item: { week: number; amount: unknown }) => [
        Number(item.week),
        Number(item.amount) || 0,
      ]),
    );
    const weeklyExpenses = weeksInMonth
      .map((w) => ({
        week: w.week,
        amount: weeklyMap.get(w.week) || 0,
        startDate: w.startDate,
        endDate: w.endDate,
      }))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    return {
      totalExpenses,
      categoryBreakdown,
      topExpenses,
      weeklyExpenses,
    };
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
        const monday = this.getMondayOfWeek(current);
        const sunday = this.getSundayOfWeek(current);
        weekMap.set(isoWeek, { week: isoWeek, startDate: monday, endDate: sunday });
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
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  }

  private getSundayOfWeek(date: Date): Date {
    const monday = this.getMondayOfWeek(date);
    const sunday = new Date(monday);
    sunday.setUTCDate(sunday.getUTCDate() + 6);
    return sunday;
  }

  private getISOWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
