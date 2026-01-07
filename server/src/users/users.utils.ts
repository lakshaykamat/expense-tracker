/**
 * User utility functions
 * Helper functions for data transformations
 */

export interface UserProfile {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    lastLoginAt?: Date;
  };
}

export function buildUserProfile(user: any): UserProfile {
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

export function generateExportFilename(): string {
  return `expense-tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
}

export function buildCSVExport(
  expenses: any[],
  budgets: any[],
  expenseHeaders: string[],
  budgetHeaders: string[],
  convertToCSV: (data: any[], headers: string[]) => string,
): string {
  const expenseCSV =
    expenses.length > 0
      ? `EXPENSES\n${convertToCSV(expenses, expenseHeaders)}\n\n`
      : 'EXPENSES\nNo expenses found.\n\n';

  const budgetCSV =
    budgets.length > 0
      ? `BUDGETS\n${convertToCSV(budgets, budgetHeaders)}`
      : 'BUDGETS\nNo budgets found.';

  return expenseCSV + budgetCSV;
}

