import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateExpenseDto } from '../presentation/dto/create-expense.dto';
import { UpdateExpenseDto } from '../presentation/dto/update-expense.dto';
import { Expense, ExpenseDocument } from '../domain/schemas/expense.schema';
import {
  getMonthDateRange,
  getCurrentMonth,
} from '../../common/utils/date.utils';
import {
  isValidObjectId,
  isValidMonthFormat,
} from '../../common/utils/validation.utils';
import { toObjectId } from '../../common/utils/query.utils';
import { ExpensesRepository } from './repositories/expenses.repository';
import {
  formatExpenseForExport,
  prepareExpenseForCreate,
  prepareExpenseForUpdate,
  buildDailySpendingArray,
  extractUniqueMonths,
  buildMonthRanges,
  buildTotalsMap,
} from './utils/expenses.utils';

@Injectable()
export class ExpensesService {
  private repository: ExpensesRepository;

  constructor(
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<ExpenseDocument>,
  ) {
    this.repository = new ExpensesRepository(this.expenseModel);
  }

  async create(createExpenseDto: CreateExpenseDto, userId: string) {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const date = createExpenseDto.date
      ? new Date(createExpenseDto.date + 'T00:00:00.000Z')
      : new Date();

    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.repository.create({
      ...createExpenseDto,
      userId,
      date,
    });
  }

  async bulkCreate(createExpenseDtos: CreateExpenseDto[], userId: string) {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    if (!Array.isArray(createExpenseDtos) || createExpenseDtos.length === 0) {
      throw new BadRequestException(
        'Expenses array is required and cannot be empty',
      );
    }

    if (createExpenseDtos.length > 100) {
      throw new BadRequestException(
        'Cannot create more than 100 expenses at once',
      );
    }

    const userIdObj = toObjectId(userId);
    const expenses = createExpenseDtos.map((dto) =>
      prepareExpenseForCreate(dto, userId, userIdObj),
    );

    const result = await this.repository.bulkCreate(expenses);
    return {
      message: `${result.length} expenses created successfully`,
      expenses: result,
    };
  }

  async findAll(userId: string, month?: string) {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const monthToUse = month || getCurrentMonth();
    let dateQuery: any = undefined;

    if (monthToUse) {
      if (!isValidMonthFormat(monthToUse)) {
        throw new BadRequestException('Invalid month format. Expected YYYY-MM');
      }
      try {
        const { startDate, endDate } = getMonthDateRange(monthToUse);
        dateQuery = {
          $gte: startDate,
          $lt: endDate,
        };
      } catch (error: any) {
        throw new BadRequestException(error.message || 'Invalid month format');
      }
    }

    return this.repository.findAll(userId, dateQuery);
  }

  async findAllForExport(userId: string): Promise<any[]> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const expenses = await this.repository.findAllForExport(userId);
    return expenses.map(formatExpenseForExport);
  }

  async getTotalExpensesForMonth(
    userId: string,
    month: string,
  ): Promise<number> {
    if (!isValidMonthFormat(month) || !isValidObjectId(userId)) {
      return 0;
    }

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
    if (months.length === 0 || !isValidObjectId(userId)) {
      return new Map();
    }

    const validMonths = months.filter((month) => isValidMonthFormat(month));
    if (validMonths.length === 0) {
      return new Map();
    }

    try {
      const monthRanges = buildMonthRanges(validMonths, getMonthDateRange);
      if (monthRanges.length === 0) {
        return new Map();
      }

      const result = await this.repository.getTotalForMonths(
        userId,
        monthRanges,
      );
      return buildTotalsMap(result, validMonths);
    } catch {
      return new Map();
    }
  }

  async getDailySpending(
    userId: string,
    month: string,
  ): Promise<Array<{ day: number; spending: number }>> {
    if (!isValidMonthFormat(month) || !isValidObjectId(userId)) {
      return [];
    }

    try {
      const { startDate, endDate } = getMonthDateRange(month);
      const result = await this.repository.getDailySpending(
        userId,
        startDate,
        endDate,
      );

      const daysInMonth = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        0,
      ).getDate();

      const currentMonth = getCurrentMonth();
      const maxDay =
        month === currentMonth ? new Date().getUTCDate() : daysInMonth;

      return buildDailySpendingArray(result, maxDay);
    } catch {
      return [];
    }
  }

  async getCategoryBreakdown(
    userId: string,
    month: string,
  ): Promise<Array<{ category: string; amount: number }>> {
    if (!isValidMonthFormat(month) || !isValidObjectId(userId)) {
      return [];
    }

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
    limit: number = 5,
  ): Promise<Array<{ title: string; amount: number }>> {
    if (!isValidMonthFormat(month) || !isValidObjectId(userId)) {
      return [];
    }

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
  ): Promise<Array<{ week: number; amount: number }>> {
    if (!isValidMonthFormat(month) || !isValidObjectId(userId)) {
      return [];
    }

    try {
      const { startDate, endDate } = getMonthDateRange(month);
      return this.repository.getWeeklyExpenses(userId, startDate, endDate);
    } catch {
      return [];
    }
  }

  async findOne(id: string, userId: string) {
    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const expense = await this.repository.findById(id, userId);
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string) {
    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      throw new BadRequestException('Invalid ID format');
    }

    try {
      const updateData = prepareExpenseForUpdate(updateExpenseDto);
      const expense = await this.repository.update(id, userId, updateData);
      if (!expense) {
        throw new NotFoundException('Expense not found');
      }
      return expense;
    } catch (error: any) {
      if (error.message === 'Invalid date format') {
        throw new BadRequestException('Invalid date format');
      }
      throw error;
    }
  }

  async bulkUpdate(
    expenses: Array<{
      title: string;
      amount: number;
      description?: string;
      category?: string;
      date: string;
    }>,
    userId: string,
  ) {
    if (!Array.isArray(expenses) || expenses.length === 0) {
      throw new BadRequestException(
        'Expenses array is required and cannot be empty',
      );
    }

    if (expenses.length > 100) {
      throw new BadRequestException(
        'Cannot update more than 100 expenses at once',
      );
    }

    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const uniqueMonths = extractUniqueMonths(expenses);
    if (uniqueMonths.length === 0) {
      throw new BadRequestException('No valid month dates found in expenses');
    }

    const results: any[] = [];
    const userIdObj = toObjectId(userId);

    for (const month of uniqueMonths) {
      const { startDate, endDate } = getMonthDateRange(month);
      await this.repository.deleteByDateRange(userId, startDate, endDate);

      const monthExpenses = expenses.filter(
        (expense) => expense.date.substring(0, 7) === month,
      );

      const newExpenses = monthExpenses.map((expense) =>
        prepareExpenseForCreate(expense, userId, userIdObj),
      );

      const result = await this.repository.bulkCreate(newExpenses);
      results.push(...result);
    }

    return {
      message: `Replaced expenses for ${uniqueMonths.length} month(s) with ${results.length} new expenses`,
      expenses: results,
    };
  }

  async remove(id: string, userId: string) {
    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const deleted = await this.repository.delete(id, userId);
    if (!deleted) {
      throw new NotFoundException('Expense not found');
    }

    return { message: 'Expense deleted successfully' };
  }

  async bulkRemove(ids: string[], userId: string) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException(
        'IDs array is required and cannot be empty',
      );
    }

    if (ids.length > 100) {
      throw new BadRequestException(
        'Cannot delete more than 100 expenses at once',
      );
    }

    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const validIds = ids.filter((id) => isValidObjectId(id));
    if (validIds.length === 0) {
      throw new BadRequestException('No valid expense IDs provided');
    }

    const deletedCount = await this.repository.bulkDelete(validIds, userId);
    if (deletedCount === 0) {
      throw new NotFoundException('No expenses found to delete');
    }

    return {
      message: `${deletedCount} expenses deleted successfully`,
      deletedCount,
    };
  }
}
