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
    const budgets = await this.budgetModel
      .find(userIdQuery)
      .sort({ month: -1 })
      .lean()
      .exec();

    if (budgets.length === 0) {
      return [];
    }

    const months = budgets.map((b) => b.month);
    const spentAmountsMap =
      await this.expensesService.getTotalExpensesForMonths(userId, months);

    return budgets.map((budget) => ({
      ...budget,
      totalBudget: this.calculateTotalBudget(budget.essentialItems),
      spentAmount: spentAmountsMap.get(budget.month) || 0,
    }));
  }

  async findAllForExport(userId: string): Promise<any[]> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const userIdQuery = buildUserIdQuery(userId);
    const budgets = await this.budgetModel
      .find(userIdQuery)
      .sort({ month: -1 })
      .lean();
    return budgets.map((budget: any) => ({
      _id: budget._id.toString(),
      month: budget.month,
      essentialItems: JSON.stringify(budget.essentialItems || []),
      totalBudget: this.calculateTotalBudget(budget.essentialItems || []),
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
    const budget = await this.budgetModel.findOne(query).lean();
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

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
    const budget = await this.budgetModel.findOneAndUpdate(
      query,
      updateBudgetDto,
      { new: true, lean: true },
    );

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

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

    const budget = await this.budgetModel.findOne(query).lean();

    if (!budget) {
      return null;
    }

    return this.buildBudgetResponse(budget, userId);
  }

  async getCurrentBudget(userId: string) {
    const currentMonth = getCurrentMonth();

    const userIdQuery = buildUserIdQuery(userId);
    let budget = await this.budgetModel.findOne({
      ...userIdQuery,
      month: currentMonth,
    });

    if (!budget) {
      budget = await this.copyMostRecentBudget(userId, currentMonth);
    }

    if (!budget) {
      return null;
    }

    const budgetObj = budget.toObject();
    return this.buildBudgetResponse(budgetObj, userId);
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

  private calculateTotalBudget(essentialItems: EssentialItem[]): number {
    return essentialItems.reduce(
      (total, item) => total + (item.amount || 0),
      0,
    );
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
      totalBudget: this.calculateTotalBudget(budget.essentialItems),
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
    const savedBudgetObj = savedBudget.toObject();
    return this.buildBudgetResponse(savedBudgetObj, userId);
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
    const savedBudgetObj = savedBudget.toObject();
    return this.buildBudgetResponse(savedBudgetObj, userId);
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
    const [budgetDoc, totalExpenses, categoryBreakdown, dailySpending] =
      await Promise.all([
        this.budgetModel.findOne(budgetQuery).lean(),
        this.calculateSpentAmount(userId, month),
        this.expensesService.getCategoryBreakdown(userId, month),
        this.expensesService.getDailySpending(userId, month),
      ]);

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
        categoryBreakdown,
        dailySpending,
        dailyAverageSpend,
        topCategories,
      };
    }

    const totalBudget = this.calculateTotalBudget(
      budgetDoc.essentialItems || [],
    );
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
      categoryBreakdown,
      dailySpending,
      dailyAverageSpend,
      topCategories,
    };
  }
}
