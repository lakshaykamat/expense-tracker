/**
 * Budget business logic helpers
 */

import type { Budget } from "@/types";
import { getCurrentMonth } from "@/utils/date.utils";

/**
 * Validates budget item data (business rules)
 */
export function validateBudgetItemData(data: {
  name?: string;
  amount?: number;
}): { valid: boolean; error?: string } {
  // Validate name
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    return { valid: false, error: 'Item name is required' };
  }
  const trimmedName = data.name.trim();
  if (trimmedName.length < 3) {
    return { valid: false, error: 'Item name must be at least 3 characters long' };
  }
  if (trimmedName.length > 100) {
    return { valid: false, error: 'Item name must be at most 100 characters long' };
  }

  // Validate amount (optional)
  if (data.amount !== undefined && data.amount !== null) {
    if (typeof data.amount !== 'number' || isNaN(data.amount)) {
      return { valid: false, error: 'Amount must be a valid number' };
    }
    if (!isFinite(data.amount)) {
      return { valid: false, error: 'Amount must be a finite number' };
    }
    if (data.amount < 0.01) {
      return { valid: false, error: 'Amount must be at least ₹0.01' };
    }
  }

  return { valid: true };
}

/**
 * Checks if the current budget should be updated based on the month
 */
export function shouldUpdateCurrentBudget(month: string): boolean {
  const currentMonth = getCurrentMonth();
  return month === currentMonth;
}

/**
 * Updates budget state after a budget update
 */
export function updateBudgetState(
  budgets: Budget[],
  updatedBudget: Budget,
  currentBudget: Budget | null,
  budgetId: string
): { budgets: Budget[]; currentBudget: Budget | null } {
  const newBudgets = budgets.map((budget) =>
    budget._id === budgetId ? updatedBudget : budget
  );

  const newCurrentBudget =
    currentBudget && currentBudget._id === budgetId
      ? updatedBudget
      : currentBudget;

  return {
    budgets: newBudgets,
    currentBudget: newCurrentBudget,
  };
}

/**
 * Removes budget from state after deletion
 */
export function removeBudgetState(
  budgets: Budget[],
  currentBudget: Budget | null,
  budgetId: string
): { budgets: Budget[]; currentBudget: Budget | null } {
  const newBudgets = budgets.filter((budget) => budget._id !== budgetId);

  const newCurrentBudget =
    currentBudget && currentBudget._id === budgetId ? null : currentBudget;

  return {
    budgets: newBudgets,
    currentBudget: newCurrentBudget,
  };
}
