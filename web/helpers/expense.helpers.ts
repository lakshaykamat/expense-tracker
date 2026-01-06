/**
 * Expense business logic helpers
 */

import { getCurrentMonth, getMonthFromDate } from "@/utils/date.utils";

/**
 * Checks if an expense should be added to current month's list
 */
export function shouldIncludeInCurrentMonth(
  expenseDate: Date | string | undefined,
  currentMonth: string
): boolean {
  const expenseMonth = getMonthFromDate(expenseDate || new Date());
  return expenseMonth === currentMonth;
}

/**
 * Validates expense data (business rules)
 */
export function validateExpenseData(data: {
  title?: string;
  amount?: number;
}): { valid: boolean; error?: string } {
  if (!data.title || !data.title.trim()) {
    return { valid: false, error: "Title is required" };
  }
  const trimmedTitle = data.title.trim();
  if (trimmedTitle.length < 3) {
    return { valid: false, error: "Title must be at least 3 characters long" };
  }
  if (trimmedTitle.length > 100) {
    return { valid: false, error: "Title must be at most 100 characters long" };
  }
  if (!data.amount || data.amount < 0.01) {
    return { valid: false, error: "Amount must be at least ₹0.01" };
  }
  return { valid: true };
}

/**
 * Validates expense ID (business rule)
 */
export function validateExpenseId(id: string | undefined): boolean {
  return !!(id && typeof id === "string");
}
