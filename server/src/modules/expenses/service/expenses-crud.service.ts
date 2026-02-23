import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ExpensesRepository } from '../repository/expenses.repository';
import {
  prepareExpenseForCreate,
  prepareExpenseForUpdate,
  extractUniqueMonths,
  buildMonthRanges,
} from '../utils/expenses.utils';
import { getMonthDateRange } from '../../../common/utils/date.utils';
import { isValidObjectId } from '../../../common/utils/validation.utils';
import { toObjectId } from '../../../common/utils/query.utils';

const BULK_LIMIT = 100;

@Injectable()
export class ExpensesCrudService {
  constructor(private readonly repository: ExpensesRepository) {}

  async create(
    dto: { title: string; amount: number; description?: string; category?: string; date?: string },
    userId: string,
  ) {
    if (!isValidObjectId(userId)) throw new BadRequestException('Invalid user ID format');
    const date = dto.date
      ? new Date(dto.date + 'T00:00:00.000Z')
      : new Date();
    if (isNaN(date.getTime())) throw new BadRequestException('Invalid date format');
    return this.repository.create({
      ...dto,
      userId,
      date,
    });
  }

  async bulkCreate(
    dtos: Array<{ title: string; amount: number; description?: string; category?: string; date?: string }>,
    userId: string,
  ) {
    if (!isValidObjectId(userId)) throw new BadRequestException('Invalid user ID format');
    if (!Array.isArray(dtos) || dtos.length === 0) {
      throw new BadRequestException('Expenses array is required and cannot be empty');
    }
    if (dtos.length > BULK_LIMIT) {
      throw new BadRequestException(`Cannot create more than ${BULK_LIMIT} expenses at once`);
    }
    const userIdObj = toObjectId(userId);
    const expenses = dtos.map((dto) =>
      prepareExpenseForCreate(dto, userId, userIdObj),
    );
    const result = await this.repository.bulkCreate(expenses);
    return { message: `${result.length} expenses created successfully`, expenses: result };
  }

  async findOne(id: string, userId: string) {
    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      throw new BadRequestException('Invalid ID format');
    }
    const expense = await this.repository.findById(id, userId);
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(id: string, dto: Record<string, unknown> & { title?: string; amount?: number; description?: string; category?: string; date?: string }, userId: string) {
    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      throw new BadRequestException('Invalid ID format');
    }
    const updateData = prepareExpenseForUpdate(dto);
    const expense = await this.repository.update(id, userId, updateData);
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
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
      throw new BadRequestException('Expenses array is required and cannot be empty');
    }
    if (expenses.length > BULK_LIMIT) {
      throw new BadRequestException(`Cannot update more than ${BULK_LIMIT} expenses at once`);
    }
    if (!isValidObjectId(userId)) throw new BadRequestException('Invalid user ID format');
    const uniqueMonths = extractUniqueMonths(expenses);
    if (uniqueMonths.length === 0) {
      throw new BadRequestException('No valid month dates found in expenses');
    }
    const userIdObj = toObjectId(userId);
    const results: unknown[] = [];
    for (const month of uniqueMonths) {
      const { startDate, endDate } = getMonthDateRange(month);
      await this.repository.deleteByDateRange(userId, startDate, endDate);
      const monthExpenses = expenses.filter((e) => e.date?.substring(0, 7) === month);
      const newExpenses = monthExpenses.map((e) =>
        prepareExpenseForCreate(e, userId, userIdObj) as Parameters<ExpensesRepository['bulkCreate']>[0][0],
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
    if (!deleted) throw new NotFoundException('Expense not found');
    return { message: 'Expense deleted successfully' };
  }

  async bulkRemove(ids: string[], userId: string) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('IDs array is required and cannot be empty');
    }
    if (ids.length > BULK_LIMIT) {
      throw new BadRequestException(`Cannot delete more than ${BULK_LIMIT} expenses at once`);
    }
    if (!isValidObjectId(userId)) throw new BadRequestException('Invalid user ID format');
    const validIds = ids.filter((id) => isValidObjectId(id));
    if (validIds.length === 0) throw new BadRequestException('No valid expense IDs provided');
    const deletedCount = await this.repository.bulkDelete(validIds, userId);
    if (deletedCount === 0) throw new NotFoundException('No expenses found to delete');
    return { message: `${deletedCount} expenses deleted successfully`, deletedCount };
  }
}
