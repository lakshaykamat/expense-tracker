import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense, ExpenseDocument } from './schemas/expense.schema';

@Injectable()
export class ExpensesService {
  constructor(@InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string) {
    const expense = new this.expenseModel({
      ...createExpenseDto,
      userId,
      date: createExpenseDto.date ? new Date(createExpenseDto.date) : new Date(),
    });
    
    return expense.save();
  }

  async bulkCreate(createExpenseDtos: CreateExpenseDto[], userId: string) {
    const expenses = createExpenseDtos.map(dto => ({
      ...dto,
      userId,
      date: dto.date ? new Date(dto.date) : new Date(),
    }));

    const result = await this.expenseModel.insertMany(expenses);
    return {
      message: `${result.length} expenses created successfully`,
      expenses: result
    };
  }

  async findAll(userId: string) {
    return this.expenseModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findOne(id: string, userId: string) {
    const expense = await this.expenseModel.findOne({ _id: id, userId });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string) {
    const expense = await this.expenseModel.findOneAndUpdate(
      { _id: id, userId },
      { 
        ...updateExpenseDto,
        ...(updateExpenseDto.date && { date: new Date(updateExpenseDto.date) })
      },
      { new: true }
    );
    
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    
    return expense;
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateExpenseDto }>, userId: string) {
    const results: any[] = [];
    const errors: Array<{ id: string; error: string }> = [];

    for (const update of updates) {
      try {
        const expense = await this.update(update.id, update.data, userId);
        results.push(expense);
      } catch (error: any) {
        errors.push({
          id: update.id,
          error: error.message
        });
      }
    }

    return {
      message: `Updated ${results.length} expenses successfully`,
      updated: results,
      errors: errors
    };
  }

  async remove(id: string, userId: string) {
    const result = await this.expenseModel.deleteOne({ _id: id, userId });
    
    if (result.deletedCount === 0) {
      throw new NotFoundException('Expense not found');
    }
    
    return { message: 'Expense deleted successfully' };
  }

  async bulkRemove(ids: string[], userId: string) {
    const result = await this.expenseModel.deleteMany({ _id: { $in: ids }, userId });
    
    if (result.deletedCount === 0) {
      throw new NotFoundException('No expenses found to delete');
    }
    
    return { 
      message: `${result.deletedCount} expenses deleted successfully`,
      deletedCount: result.deletedCount
    };
  }
}
