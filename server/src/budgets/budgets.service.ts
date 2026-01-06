import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget, BudgetDocument, EssentialItem } from './schemas/budget.schema';
import { ExpensesService } from '../expenses/expenses.service';
import { getCurrentMonth } from '../common/utils/date.utils';
import {
  isValidObjectId,
  isValidMonthFormat,
} from '../common/utils/validation.utils';
import {
  buildUserIdQuery,
  toObjectId,
  buildIdAndUserIdQuery,
} from '../common/utils/query.utils';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
    @Inject(forwardRef(() => ExpensesService))
    private expensesService: ExpensesService,
  ) {}

  async create(createBudgetDto: CreateBudgetDto, userId: string) {
    if (!isValidMonthFormat(createBudgetDto.month)) {
      throw new BadRequestException('Invalid month format. Expected YYYY-MM');
    }

    const userIdQuery = buildUserIdQuery(userId);
    const existingBudget = await this.budgetModel.findOne({
      ...userIdQuery,
      month: createBudgetDto.month,
    });

    if (existingBudget) {
      throw new BadRequestException('Budget already exists for this month');
    }

    const budget = new this.budgetModel({
      ...createBudgetDto,
      userId: toObjectId(userId),
      essentialItems: createBudgetDto.essentialItems || [],
    });

    return budget.save();
  }

  async findAll(userId: string) {
    const userIdQuery = buildUserIdQuery(userId);
    const budgets = await this.budgetModel.aggregate([
      { $match: userIdQuery },
      {
        $addFields: {
          essentialItems: {
            $sortArray: {
              input: { $ifNull: ['$essentialItems', []] },
              sortBy: { amount: -1 },
            },
          },
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
    ]);

    if (budgets.length === 0) {
      return [];
    }

    const months = budgets.map((b) => b.month);
    const spentAmountsMap =
      await this.expensesService.getTotalExpensesForMonths(userId, months);

    return budgets.map((budget) => ({
      ...budget,
      spentAmount: spentAmountsMap.get(budget.month) || 0,
    }));
  }

  async findAllForExport(userId: string): Promise<any[]> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const userIdQuery = buildUserIdQuery(userId);
    const budgets = await this.budgetModel.aggregate([
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
    ]);

    return budgets.map((budget: any) => ({
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
    }));
  }

  async findOne(id: string, userId: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid budget ID format');
    }

    const query = buildIdAndUserIdQuery(id, userId);
    const budgets = await this.budgetModel.aggregate([
      { $match: query },
      {
        $addFields: {
          essentialItems: {
            $sortArray: {
              input: { $ifNull: ['$essentialItems', []] },
              sortBy: { amount: -1 },
            },
          },
          totalBudget: {
            $reduce: {
              input: { $ifNull: ['$essentialItems', []] },
              initialValue: 0,
              in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
            },
          },
        },
      },
    ]);

    if (!budgets || budgets.length === 0) {
      throw new NotFoundException('Budget not found');
    }

    const budget = budgets[0];
    return this.buildBudgetResponse(budget, userId);
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto, userId: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid budget ID format');
    }

    if (updateBudgetDto.month && !isValidMonthFormat(updateBudgetDto.month)) {
      throw new BadRequestException('Invalid month format. Expected YYYY-MM');
    }

    const query = buildIdAndUserIdQuery(id, userId);
    const updatedBudget = await this.budgetModel.findOneAndUpdate(
      query,
      updateBudgetDto,
      { new: true },
    );

    if (!updatedBudget) {
      throw new NotFoundException('Budget not found');
    }

    const budgets = await this.budgetModel.aggregate([
      { $match: { _id: updatedBudget._id } },
      {
        $addFields: {
          essentialItems: {
            $sortArray: {
              input: { $ifNull: ['$essentialItems', []] },
              sortBy: { amount: -1 },
            },
          },
          totalBudget: {
            $reduce: {
              input: { $ifNull: ['$essentialItems', []] },
              initialValue: 0,
              in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
            },
          },
        },
      },
    ]);

    const budget = budgets[0];
    return this.buildBudgetResponse(budget, userId);
  }

  async remove(id: string, userId: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid budget ID format');
    }

    const query = buildIdAndUserIdQuery(id, userId);
    const result = await this.budgetModel.deleteOne(query);
    if (result.deletedCount === 0) {
      throw new NotFoundException('Budget not found');
    }
  }

  async findByMonth(userId: string, month: string) {
    if (!isValidMonthFormat(month)) {
      throw new BadRequestException('Invalid month format. Expected YYYY-MM');
    }

    const userIdQuery = buildUserIdQuery(userId);
    const query = { ...userIdQuery, month };

    const budgets = await this.budgetModel.aggregate([
      { $match: query },
      {
        $addFields: {
          essentialItems: {
            $sortArray: {
              input: { $ifNull: ['$essentialItems', []] },
              sortBy: { amount: -1 },
            },
          },
          totalBudget: {
            $reduce: {
              input: { $ifNull: ['$essentialItems', []] },
              initialValue: 0,
              in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
            },
          },
        },
      },
    ]);

    if (!budgets || budgets.length === 0) {
      return null;
    }

    const budget = budgets[0];
    return this.buildBudgetResponse(budget, userId);
  }

  async getCurrentBudget(userId: string) {
    const currentMonth = getCurrentMonth();

    const userIdQuery = buildUserIdQuery(userId);
    const budgets = await this.budgetModel.aggregate([
      { $match: { ...userIdQuery, month: currentMonth } },
      {
        $addFields: {
          essentialItems: {
            $sortArray: {
              input: { $ifNull: ['$essentialItems', []] },
              sortBy: { amount: -1 },
            },
          },
          totalBudget: {
            $reduce: {
              input: { $ifNull: ['$essentialItems', []] },
              initialValue: 0,
              in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
            },
          },
        },
      },
    ]);

    let budget = budgets && budgets.length > 0 ? budgets[0] : null;

    if (!budget) {
      const copiedBudget = await this.copyMostRecentBudget(
        userId,
        currentMonth,
      );
      if (copiedBudget) {
        const sortedBudgets = await this.budgetModel.aggregate([
          { $match: { _id: copiedBudget._id } },
          {
            $addFields: {
              essentialItems: {
                $sortArray: {
                  input: { $ifNull: ['$essentialItems', []] },
                  sortBy: { amount: -1 },
                },
              },
              totalBudget: {
                $reduce: {
                  input: { $ifNull: ['$essentialItems', []] },
                  initialValue: 0,
                  in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
                },
              },
            },
          },
        ]);
        budget =
          sortedBudgets && sortedBudgets.length > 0 ? sortedBudgets[0] : null;
      }
    }

    if (!budget) {
      return null;
    }

    return this.buildBudgetResponse(budget, userId);
  }

  private async copyMostRecentBudget(userId: string, currentMonth: string) {
    const userIdQuery = buildUserIdQuery(userId);
    const recentBudget = await this.budgetModel
      .findOne({
        ...userIdQuery,
        month: { $lt: currentMonth },
      })
      .sort({ month: -1 })
      .exec();

    if (!recentBudget) {
      return null;
    }

    const newBudget = new this.budgetModel({
      userId: toObjectId(userId),
      month: currentMonth,
      essentialItems: recentBudget.essentialItems,
    });

    return await newBudget.save();
  }

  private async calculateSpentAmount(
    userId: string,
    month: string,
  ): Promise<number> {
    return this.expensesService.getTotalExpensesForMonth(userId, month);
  }

  private async buildBudgetResponse(budget: any, userId: string): Promise<any> {
    const spentAmount = await this.calculateSpentAmount(userId, budget.month);
    return {
      ...budget,
      spentAmount,
    };
  }

  async addEssentialItem(
    budgetId: string,
    item: EssentialItem,
    userId: string,
  ) {
    if (!isValidObjectId(budgetId)) {
      throw new BadRequestException('Invalid budget ID format');
    }

    if (
      !item.name ||
      typeof item.name !== 'string' ||
      item.name.trim().length === 0
    ) {
      throw new BadRequestException('Item name is required');
    }

    if (
      item.amount !== undefined &&
      (item.amount < 0 || !isFinite(item.amount))
    ) {
      throw new BadRequestException(
        'Item amount must be a valid positive number',
      );
    }

    const query = buildIdAndUserIdQuery(budgetId, userId);
    const budget = await this.budgetModel.findOne(query);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const existingItem = budget.essentialItems.find(
      (existing) => existing.name === item.name,
    );

    if (!existingItem) {
      budget.essentialItems.push(item);
    }

    const savedBudget = await budget.save();

    const budgets = await this.budgetModel.aggregate([
      { $match: { _id: savedBudget._id } },
      {
        $addFields: {
          essentialItems: {
            $sortArray: {
              input: { $ifNull: ['$essentialItems', []] },
              sortBy: { amount: -1 },
            },
          },
          totalBudget: {
            $reduce: {
              input: { $ifNull: ['$essentialItems', []] },
              initialValue: 0,
              in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
            },
          },
        },
      },
    ]);

    const budgetObj = budgets[0];
    return this.buildBudgetResponse(budgetObj, userId);
  }

  async removeEssentialItem(
    budgetId: string,
    itemName: string,
    userId: string,
  ) {
    if (!isValidObjectId(budgetId)) {
      throw new BadRequestException('Invalid budget ID format');
    }

    if (
      !itemName ||
      typeof itemName !== 'string' ||
      itemName.trim().length === 0
    ) {
      throw new BadRequestException('Item name is required');
    }

    const query = buildIdAndUserIdQuery(budgetId, userId);
    const budget = await this.budgetModel.findOne(query);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    budget.essentialItems = budget.essentialItems.filter(
      (item) => item.name !== itemName,
    );

    const savedBudget = await budget.save();

    const budgets = await this.budgetModel.aggregate([
      { $match: { _id: savedBudget._id } },
      {
        $addFields: {
          essentialItems: {
            $sortArray: {
              input: { $ifNull: ['$essentialItems', []] },
              sortBy: { amount: -1 },
            },
          },
          totalBudget: {
            $reduce: {
              input: { $ifNull: ['$essentialItems', []] },
              initialValue: 0,
              in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
            },
          },
        },
      },
    ]);

    const budgetObj = budgets[0];
    return this.buildBudgetResponse(budgetObj, userId);
  }

  async getEssentialItems(budgetId: string, userId: string) {
    if (!isValidObjectId(budgetId)) {
      throw new BadRequestException('Invalid budget ID format');
    }

    const query = buildIdAndUserIdQuery(budgetId, userId);
    const budget = await this.budgetModel.findOne(query);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return budget.essentialItems || [];
  }

  async getAnalysisStats(userId: string, month: string) {
    if (!isValidMonthFormat(month)) {
      throw new BadRequestException('Invalid month format. Expected YYYY-MM');
    }

    // Get budget directly to avoid duplicate calculateSpentAmount call from buildBudgetResponse
    const userIdQuery = buildUserIdQuery(userId);
    const budgetQuery = { ...userIdQuery, month };

    // Parallelize all independent database queries
    const [budgetDocs, totalExpenses, categoryBreakdown] = await Promise.all([
      this.budgetModel.aggregate([
        { $match: budgetQuery },
        {
          $addFields: {
            essentialItems: {
              $sortArray: {
                input: { $ifNull: ['$essentialItems', []] },
                sortBy: { amount: -1 },
              },
            },
            totalBudget: {
              $reduce: {
                input: { $ifNull: ['$essentialItems', []] },
                initialValue: 0,
                in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
              },
            },
          },
        },
      ]),
      this.calculateSpentAmount(userId, month),
      this.expensesService.getCategoryBreakdown(userId, month),
    ]);

    const budgetDoc =
      budgetDocs && budgetDocs.length > 0 ? budgetDocs[0] : null;

    // Calculate days in month (simple calculation, no database call)
    const [year, monthNum] = month.split('-');
    const daysInMonth = new Date(
      parseInt(year, 10),
      parseInt(monthNum, 10),
      0,
    ).getDate();

    // Calculate daily average spend
    const dailyAverageSpend = daysInMonth > 0 ? totalExpenses / daysInMonth : 0;

    // Get top spending categories (top 5)
    // categoryBreakdown is already sorted by amount descending from aggregation
    const topCategories = categoryBreakdown.slice(0, 5);

    if (!budgetDoc) {
      return {
        totalBudget: 0,
        totalExpenses,
        remainingBudget: 0,
        budgetUsedPercentage: 0,
        budgetExists: false,
        dailyAverageSpend,
        topCategories,
      };
    }

    const totalBudget = budgetDoc.totalBudget || 0;
    const remainingBudget = totalBudget - totalExpenses;
    const budgetUsedPercentage =
      totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

    return {
      budget: {
        ...budgetDoc,
        totalBudget,
        spentAmount: totalExpenses,
      },
      totalExpenses,
      totalBudget,
      remainingBudget,
      budgetUsedPercentage,
      budgetExists: true,
      dailyAverageSpend,
      topCategories,
    };
  }
}
