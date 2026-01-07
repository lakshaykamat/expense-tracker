import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBudgetDto } from '../presentation/dto/create-budget.dto';
import { UpdateBudgetDto } from '../presentation/dto/update-budget.dto';
import {
  Budget,
  BudgetDocument,
  EssentialItem,
} from '../domain/schemas/budget.schema';
import { ExpensesService } from '../../expenses/application/expenses.service';
import { getCurrentMonth } from '../../common/utils/date.utils';
import {
  isValidObjectId,
  isValidMonthFormat,
} from '../../common/utils/validation.utils';
import { BudgetsRepository } from './repositories/budgets.repository';
import {
  calculateDaysForAverage,
  calculateDailyAverage,
  calculateBudgetUsedPercentage,
  calculateRemainingBudget,
  formatBudgetForExport,
  validateEssentialItem,
} from './utils/budgets.utils';

@Injectable()
export class BudgetsService {
  private repository: BudgetsRepository;

  constructor(
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
    @Inject(forwardRef(() => ExpensesService))
    private expensesService: ExpensesService,
  ) {
    this.repository = new BudgetsRepository(this.budgetModel);
  }

  async create(createBudgetDto: CreateBudgetDto, userId: string) {
    if (!isValidMonthFormat(createBudgetDto.month)) {
      throw new BadRequestException('Invalid month format. Expected YYYY-MM');
    }

    const exists = await this.repository.exists(userId, createBudgetDto.month);
    if (exists) {
      throw new BadRequestException('Budget already exists for this month');
    }

    return this.repository.create({
      userId,
      month: createBudgetDto.month,
      essentialItems: createBudgetDto.essentialItems,
    });
  }

  async findAll(userId: string) {
    const budgets = await this.repository.findAll(userId);

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

    const budgets = await this.repository.findAllForExport(userId);
    return budgets.map(formatBudgetForExport);
  }

  async findOne(id: string, userId: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid budget ID format');
    }

    const budget = await this.repository.findById(id, userId);
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

    const updatedBudget = await this.repository.update(
      id,
      userId,
      updateBudgetDto,
    );
    if (!updatedBudget) {
      throw new NotFoundException('Budget not found');
    }

    const budget = await this.repository.findOneById(
      updatedBudget._id.toString(),
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

    const deleted = await this.repository.delete(id, userId);
    if (!deleted) {
      throw new NotFoundException('Budget not found');
    }
  }

  async findByMonth(userId: string, month: string) {
    if (!isValidMonthFormat(month)) {
      throw new BadRequestException('Invalid month format. Expected YYYY-MM');
    }

    const budget = await this.repository.findByMonth(userId, month);
    if (!budget) {
      return null;
    }

    return this.buildBudgetResponse(budget, userId);
  }

  async getCurrentBudget(userId: string) {
    const currentMonth = getCurrentMonth();
    let budget = await this.repository.findCurrentMonth(userId, currentMonth);

    if (!budget) {
      const copiedBudget = await this.copyMostRecentBudget(
        userId,
        currentMonth,
      );
      if (copiedBudget) {
        budget = await this.repository.findOneById(copiedBudget._id.toString());
      }
    }

    if (!budget) {
      return null;
    }

    return this.buildBudgetResponse(budget, userId);
  }

  private async copyMostRecentBudget(userId: string, currentMonth: string) {
    const recentBudget = await this.repository.findMostRecentBeforeMonth(
      userId,
      currentMonth,
    );

    if (!recentBudget) {
      return null;
    }

    return this.repository.create({
      userId,
      month: currentMonth,
      essentialItems: recentBudget.essentialItems,
    });
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

    try {
      validateEssentialItem(item);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    const budget = await this.repository.findOneForUpdate(budgetId, userId);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const existingItem = budget.essentialItems.find(
      (existing) => existing.name === item.name,
    );

    if (!existingItem) {
      budget.essentialItems.push(item);
      await budget.save();
    }

    const updatedBudget = await this.repository.findOneById(
      budget._id.toString(),
    );
    if (!updatedBudget) {
      throw new NotFoundException('Budget not found');
    }

    return this.buildBudgetResponse(updatedBudget, userId);
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

    const budget = await this.repository.findOneForUpdate(budgetId, userId);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    budget.essentialItems = budget.essentialItems.filter(
      (item) => item.name !== itemName,
    );

    await budget.save();

    const updatedBudget = await this.repository.findOneById(
      budget._id.toString(),
    );
    if (!updatedBudget) {
      throw new NotFoundException('Budget not found');
    }

    return this.buildBudgetResponse(updatedBudget, userId);
  }

  async getEssentialItems(budgetId: string, userId: string) {
    if (!isValidObjectId(budgetId)) {
      throw new BadRequestException('Invalid budget ID format');
    }

    const budget = await this.repository.findById(budgetId, userId);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return budget.essentialItems || [];
  }

  async getAnalysisStats(userId: string, month: string) {
    if (!isValidMonthFormat(month)) {
      throw new BadRequestException('Invalid month format. Expected YYYY-MM');
    }

    const [budgetDoc, totalExpenses, categoryBreakdown] = await Promise.all([
      this.repository.findByMonth(userId, month),
      this.calculateSpentAmount(userId, month),
      this.expensesService.getCategoryBreakdown(userId, month),
    ]);

    const daysForAverage = calculateDaysForAverage(month);
    const dailyAverageSpend = calculateDailyAverage(
      totalExpenses,
      daysForAverage,
    );
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
    const remainingBudget = calculateRemainingBudget(
      totalBudget,
      totalExpenses,
    );
    const budgetUsedPercentage = calculateBudgetUsedPercentage(
      totalExpenses,
      totalBudget,
    );

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
