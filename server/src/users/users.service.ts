import { Injectable } from '@nestjs/common';
import { ExpensesService } from '../expenses/application/expenses.service';
import { BudgetsService } from '../budgets/application/budgets.service';
import { convertToCSV } from '../common/utils/csv.utils';
import {
  buildUserProfile,
  generateExportFilename,
  buildCSVExport,
  type UserProfile,
} from './users.utils';

export { UserProfile };

@Injectable()
export class UsersService {
  private readonly expenseHeaders = [
    '_id',
    'title',
    'amount',
    'description',
    'category',
    'date',
    'createdAt',
    'updatedAt',
  ];
  private readonly budgetHeaders = [
    '_id',
    'month',
    'essentialItems',
    'totalBudget',
    'userId',
    'createdAt',
    'updatedAt',
  ];

  constructor(
    private readonly expensesService: ExpensesService,
    private readonly budgetsService: BudgetsService,
  ) {}

  getProfile(user: any): UserProfile {
    return buildUserProfile(user);
  }

  async exportDataToCSV(user: any): Promise<{ csv: string; filename: string }> {
    const userId = user.userId || (user._id ? user._id.toString() : null);

    if (!userId) {
      throw new Error('User ID is required');
    }

    const [expenses, budgets] = await Promise.all([
      this.expensesService.findAllForExport(userId),
      this.budgetsService.findAllForExport(userId),
    ]);

    const csv = buildCSVExport(
      expenses,
      budgets,
      this.expenseHeaders,
      this.budgetHeaders,
      convertToCSV,
    );

    return {
      csv,
      filename: generateExportFilename(),
    };
  }
}
