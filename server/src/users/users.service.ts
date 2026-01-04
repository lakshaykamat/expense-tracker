import { Injectable } from '@nestjs/common';
import { ExpensesService } from '../expenses/expenses.service';
import { BudgetsService } from '../budgets/budgets.service';
import { convertToCSV } from '../common/utils/csv.utils';

export interface UserProfile {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    lastLoginAt?: Date;
  };
}

@Injectable()
export class UsersService {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly budgetsService: BudgetsService
  ) {}

  getProfile(user: any): UserProfile {
    return {
      message: 'Profile data',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }

  async exportDataToCSV(user: any): Promise<{ csv: string; filename: string }> {
    const userId = user.userId || (user._id ? user._id.toString() : null);
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const [expenses, budgets] = await Promise.all([
      this.expensesService.findAllForExport(userId),
      this.budgetsService.findAllForExport(userId)
    ]);

    const expenseHeaders = ['_id', 'title', 'amount', 'description', 'category', 'date', 'createdAt', 'updatedAt'];
    const budgetHeaders = ['_id', 'month', 'essentialItems', 'totalBudget', 'userId', 'createdAt', 'updatedAt'];
    
    const expenseCSV = expenses.length > 0 
      ? `EXPENSES\n${convertToCSV(expenses, expenseHeaders)}\n\n`
      : 'EXPENSES\nNo expenses found.\n\n';
    
    const budgetCSV = budgets.length > 0
      ? `BUDGETS\n${convertToCSV(budgets, budgetHeaders)}`
      : 'BUDGETS\nNo budgets found.';
    
    const csv = expenseCSV + budgetCSV;
    const filename = `expense-tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
    
    return { csv, filename };
  }
}
