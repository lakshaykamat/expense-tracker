/**
 * Budget business logic helpers
 */

import { getCurrentMonth } from '@/utils/date.utils'
import type { Budget } from '@/types'

/**
 * Checks if a budget should update the current budget based on month
 */
export function shouldUpdateCurrentBudget(budgetMonth: string): boolean {
  const currentMonth = getCurrentMonth()
  return budgetMonth === currentMonth
}

/**
 * Updates budgets array and currentBudget in a single operation
 */
export function updateBudgetState<T extends Budget>(
  budgets: T[],
  updatedBudget: T,
  currentBudget: T | null,
  budgetId: string
): { budgets: T[]; currentBudget: T | null } {
  const newBudgets = budgets.map(budget => budget._id === budgetId ? updatedBudget : budget)
  const newCurrentBudget = currentBudget?._id === budgetId ? updatedBudget : currentBudget
  return { budgets: newBudgets, currentBudget: newCurrentBudget }
}

/**
 * Removes a budget from both budgets array and currentBudget
 */
export function removeBudgetState<T extends Budget>(
  budgets: T[],
  currentBudget: T | null,
  budgetId: string
): { budgets: T[]; currentBudget: T | null } {
  const newBudgets = budgets.filter(budget => budget._id !== budgetId)
  const newCurrentBudget = currentBudget?._id === budgetId ? null : currentBudget
  return { budgets: newBudgets, currentBudget: newCurrentBudget }
}

