/**
 * Budget repository
 * Database layer for budget operations
 */

import { Model } from 'mongoose';
import { BudgetDocument } from '../../domain/schemas/budget.schema';
import {
  buildBudgetAggregationPipeline,
  getBudgetWithCalculationsPipeline,
} from '../aggregations/budgets.aggregations';
import {
  buildUserIdQuery,
  toObjectId,
  buildIdAndUserIdQuery,
} from '../../../common/utils/query.utils';

export class BudgetsRepository {
  constructor(private budgetModel: Model<BudgetDocument>) {}

  async findById(id: string, userId: string) {
    const query = buildIdAndUserIdQuery(id, userId);
    const results = await this.budgetModel
      .aggregate(buildBudgetAggregationPipeline(query, false))
      .exec();
    return results.length > 0 ? results[0] : null;
  }

  async findByMonth(userId: string, month: string) {
    const userIdQuery = buildUserIdQuery(userId);
    const query = { ...userIdQuery, month };
    const results = await this.budgetModel
      .aggregate(buildBudgetAggregationPipeline(query, false))
      .exec();
    return results.length > 0 ? results[0] : null;
  }

  async findAll(userId: string) {
    const userIdQuery = buildUserIdQuery(userId);
    return this.budgetModel
      .aggregate(buildBudgetAggregationPipeline(userIdQuery, true))
      .allowDiskUse(true)
      .exec();
  }

  async findAllForExport(userId: string) {
    const userIdQuery = buildUserIdQuery(userId);
    return this.budgetModel
      .aggregate([
        { $match: userIdQuery },
        {
          $addFields: {
            totalBudget: {
              $reduce: {
                input: { $ifNull: ['$essentialItems', []] },
                initialValue: 0,
                in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
              },
            },
          },
        },
        { $sort: { month: -1 } },
      ])
      .exec();
  }

  async findCurrentMonth(userId: string, month: string) {
    const userIdQuery = buildUserIdQuery(userId);
    const query = { ...userIdQuery, month };
    const results = await this.budgetModel
      .aggregate(buildBudgetAggregationPipeline(query, false))
      .exec();
    return results.length > 0 ? results[0] : null;
  }

  async findMostRecentBeforeMonth(userId: string, month: string) {
    const userIdQuery = buildUserIdQuery(userId);
    return this.budgetModel
      .findOne({
        ...userIdQuery,
        month: { $lt: month },
      })
      .sort({ month: -1 })
      .exec();
  }

  async findOneById(id: string) {
    const results = await this.budgetModel
      .aggregate([
        { $match: { _id: toObjectId(id) } },
        ...getBudgetWithCalculationsPipeline(),
      ])
      .exec();
    return results.length > 0 ? results[0] : null;
  }

  async exists(userId: string, month: string): Promise<boolean> {
    const userIdQuery = buildUserIdQuery(userId);
    const count = await this.budgetModel.countDocuments({
      ...userIdQuery,
      month,
    });
    return count > 0;
  }

  async create(data: {
    userId: string;
    month: string;
    essentialItems?: any[];
  }) {
    const budget = new this.budgetModel({
      ...data,
      userId: toObjectId(data.userId),
      essentialItems: data.essentialItems || [],
    });
    return budget.save();
  }

  async update(id: string, userId: string, updateData: any) {
    const query = buildIdAndUserIdQuery(id, userId);
    return this.budgetModel.findOneAndUpdate(query, updateData, { new: true });
  }

  async delete(id: string, userId: string) {
    const query = buildIdAndUserIdQuery(id, userId);
    const result = await this.budgetModel.deleteOne(query);
    return result.deletedCount > 0;
  }

  async findOneForUpdate(id: string, userId: string) {
    const query = buildIdAndUserIdQuery(id, userId);
    return this.budgetModel.findOne(query);
  }
}
