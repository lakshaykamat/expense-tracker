import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { getMonthDateRange, normalizeDateToUTC, getCurrentMonth } from '../common/utils/date.utils';
import { isValidObjectId, isValidMonthFormat } from '../common/utils/validation.utils';
import { buildUserIdQuery, toObjectId, toObjectIds, buildIdAndUserIdQuery } from '../common/utils/query.utils';

@Injectable()
export class ExpensesService {
  constructor(@InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string) {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    const date = createExpenseDto.date 
      ? normalizeDateToUTC(createExpenseDto.date)
      : new Date();
    
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    
    const expense = new this.expenseModel({
      ...createExpenseDto,
      userId: toObjectId(userId),
      date,
    });
    
    return expense.save();
  }

  async bulkCreate(createExpenseDtos: CreateExpenseDto[], userId: string) {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    if (!Array.isArray(createExpenseDtos) || createExpenseDtos.length === 0) {
      throw new BadRequestException('Expenses array is required and cannot be empty');
    }
    
    if (createExpenseDtos.length > 100) {
      throw new BadRequestException('Cannot create more than 100 expenses at once');
    }
    
    const userIdObj = toObjectId(userId);
    const expenses = createExpenseDtos.map(dto => ({
      ...dto,
      userId: userIdObj,
      date: dto.date ? normalizeDateToUTC(dto.date) : new Date(),
    }));

    const result = await this.expenseModel.insertMany(expenses);
    return {
      message: `${result.length} expenses created successfully`,
      expenses: result
    };
  }

  async findAll(userId: string, month?: string) {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    const query: any = buildUserIdQuery(userId);
    
    const monthToUse = month || getCurrentMonth();
    
    if (monthToUse) {
      if (!isValidMonthFormat(monthToUse)) {
        throw new BadRequestException('Invalid month format. Expected YYYY-MM');
      }
      try {
        const { startDate, endDate } = getMonthDateRange(monthToUse);
        query.date = {
          $gte: startDate,
          $lt: endDate
        };
      } catch (error: any) {
        throw new BadRequestException(error.message || 'Invalid month format');
      }
    }
    
    return this.expenseModel.find(query).sort({ date: -1 }).lean();
  }

  async findAllForExport(userId: string): Promise<any[]> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    const query = buildUserIdQuery(userId);
    const expenses = await this.expenseModel.find(query).sort({ date: -1 }).lean();
    return expenses.map((expense: any) => ({
      _id: expense._id.toString(),
      title: expense.title,
      amount: expense.amount,
      description: expense.description || '',
      category: expense.category || '',
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
      createdAt: expense.createdAt ? new Date(expense.createdAt).toISOString().split('T')[0] : '',
      updatedAt: expense.updatedAt ? new Date(expense.updatedAt).toISOString().split('T')[0] : ''
    }));
  }

  async getTotalExpensesForMonth(userId: string, month: string): Promise<number> {
    if (!isValidMonthFormat(month)) {
      return 0;
    }
    
    if (!isValidObjectId(userId)) {
      return 0;
    }
    
    let startDate: Date;
    let endDate: Date;
    try {
      const range = getMonthDateRange(month);
      startDate = range.startDate;
      endDate = range.endDate;
    } catch {
      return 0;
    }

    try {
      const userIdQuery = buildUserIdQuery(userId);
      
      const result = await this.expenseModel.aggregate([
        {
          $match: {
            ...userIdQuery,
            date: {
              $gte: startDate,
              $lt: endDate
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const total = result.length > 0 && result[0].total !== null && result[0].total !== undefined
        ? Number(result[0].total)
        : 0;
      
      return total;
    } catch (error) {
      console.error('Error calculating total expenses for month:', month, 'userId:', userId, error);
      return 0;
    }
  }

  async getTotalExpensesForMonths(userId: string, months: string[]): Promise<Map<string, number>> {
    if (months.length === 0) {
      return new Map();
    }

    const results = await Promise.all(
      months.map(async (month) => ({
        month,
        total: await this.getTotalExpensesForMonth(userId, month)
      }))
    );

    const totalsMap = new Map<string, number>();
    results.forEach(({ month, total }) => {
      totalsMap.set(month, total);
    });

    return totalsMap;
  }

  async findOne(id: string, userId: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid expense ID format');
    }
    
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    const query = buildIdAndUserIdQuery(id, userId);
    const expense = await this.expenseModel.findOne(query);
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid expense ID format');
    }
    
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    const updateData: any = { ...updateExpenseDto };
    if (updateExpenseDto.date) {
      const date = normalizeDateToUTC(updateExpenseDto.date);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      updateData.date = date;
    }
    
    const query = buildIdAndUserIdQuery(id, userId);
    const expense = await this.expenseModel.findOneAndUpdate(
      query,
      updateData,
      { new: true }
    );
    
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    
    return expense;
  }

  async bulkUpdate(expenses: Array<{
    title: string;
    amount: number;
    description?: string;
    category?: string;
    date: string;
  }>, userId: string) {
    if (!Array.isArray(expenses) || expenses.length === 0) {
      throw new BadRequestException('Expenses array is required and cannot be empty');
    }
    
    if (expenses.length > 100) {
      throw new BadRequestException('Cannot update more than 100 expenses at once');
    }
    
    const uniqueMonths = [...new Set(expenses
      .map(expense => expense.date?.substring(0, 7))
      .filter(month => month && isValidMonthFormat(month))
    )];
    
    if (uniqueMonths.length === 0) {
      throw new BadRequestException('No valid month dates found in expenses');
    }

    const results: any[] = [];

    for (const month of uniqueMonths) {
      const { startDate, endDate } = getMonthDateRange(month);
      
      if (!isValidObjectId(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }
      
      const userIdQuery = buildUserIdQuery(userId);
      await this.expenseModel.deleteMany({
        ...userIdQuery,
        date: {
          $gte: startDate,
          $lt: endDate
        }
      });

      const monthExpenses = expenses.filter(expense => 
        expense.date.substring(0, 7) === month
      );

      const userIdObj = toObjectId(userId);
      const newExpenses = monthExpenses.map(expense => ({
        ...expense,
        userId: userIdObj,
        date: normalizeDateToUTC(expense.date)
      }));

      const result = await this.expenseModel.insertMany(newExpenses);
      results.push(...result);
    }
    
    return {
      message: `Replaced expenses for ${uniqueMonths.length} month(s) with ${results.length} new expenses`,
      expenses: results
    };
  }

  async remove(id: string, userId: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid expense ID format');
    }
    
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    const query = buildIdAndUserIdQuery(id, userId);
    const result = await this.expenseModel.deleteOne(query);
    
    if (result.deletedCount === 0) {
      throw new NotFoundException('Expense not found');
    }
    
    return { message: 'Expense deleted successfully' };
  }

  async bulkRemove(ids: string[], userId: string) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('IDs array is required and cannot be empty');
    }
    
    if (ids.length > 100) {
      throw new BadRequestException('Cannot delete more than 100 expenses at once');
    }
    
    const validIds = ids.filter(id => isValidObjectId(id));
    if (validIds.length === 0) {
      throw new BadRequestException('No valid expense IDs provided');
    }
    
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    const userIdQuery = buildUserIdQuery(userId);
    const query = {
      _id: { $in: toObjectIds(validIds) },
      ...userIdQuery
    };
    const result = await this.expenseModel.deleteMany(query);
    
    if (result.deletedCount === 0) {
      throw new NotFoundException('No expenses found to delete');
    }
    
    return { 
      message: `${result.deletedCount} expenses deleted successfully`,
      deletedCount: result.deletedCount
    };
  }
}
