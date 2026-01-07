/**
 * Expense repository
 * Database layer for expense operations
 */

import { Model } from 'mongoose';
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

    return this.expenseModel.find(query).sort({ date: -1 }).lean();
  }

  async findAllForExport(userId: string) {
    const userIdQuery = buildUserIdQuery(userId);
    return this.expenseModel.find(userIdQuery).sort({ date: -1 }).lean();
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
  ): Promise<Array<{ category: string; amount: number; count: number }>> {
    const userIdQuery = buildUserIdQuery(userId);
    const result = await this.expenseModel
      .aggregate(getCategoryBreakdownPipeline(userIdQuery, startDate, endDate))
      .exec();

    return result.map((item) => ({
      category: item.category,
      amount: Number(item.amount) || 0,
      count: Number(item.count) || 0,
    }));
  }
}
