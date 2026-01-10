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
  description?: string;
  category?: string;
}): { valid: boolean; error?: string } {
  // Validate title
  if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
    return { valid: false, error: "Title is required" };
  }
  const trimmedTitle = data.title.trim();
  if (trimmedTitle.length < 3) {
    return { valid: false, error: "Title must be at least 3 characters long" };
  }
  if (trimmedTitle.length > 100) {
    return { valid: false, error: "Title must be at most 100 characters long" };
  }

  // Validate amount
  if (
    typeof data.amount !== "number" ||
    isNaN(data.amount) ||
    data.amount < 0.01
  ) {
    return { valid: false, error: "Amount must be at least ₹0.01" };
  }
  if (!isFinite(data.amount)) {
    return { valid: false, error: "Amount must be a valid number" };
  }

  // Validate description (optional)
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== "string") {
      return { valid: false, error: "Description must be a string" };
    }
    const trimmedDesc = data.description.trim();
    if (trimmedDesc.length > 500) {
      return {
        valid: false,
        error: "Description must be at most 500 characters long",
      };
    }
  }

  // Validate category (optional)
  if (data.category !== undefined && data.category !== null) {
    if (typeof data.category !== "string") {
      return { valid: false, error: "Category must be a string" };
    }
    const trimmedCategory = data.category.trim();
    if (trimmedCategory.length > 50) {
      return {
        valid: false,
        error: "Category must be at most 50 characters long",
      };
    }
  }

  return { valid: true };
}

/**
 * Validates expense ID (business rule)
 */
export function validateExpenseId(id: string | undefined): boolean {
  return !!(id && typeof id === "string");
}
