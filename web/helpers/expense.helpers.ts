/**
 * Expense business logic helpers
 */

import { getCurrentMonth, getMonthFromDate } from '@/utils/date.utils'

/**
 * Checks if an expense should be added to current month's list
 */
export function shouldIncludeInCurrentMonth(expenseDate: Date | string | undefined, currentMonth: string): boolean {
  const expenseMonth = getMonthFromDate(expenseDate || new Date())
  return expenseMonth === currentMonth
}

/**
 * Validates expense data (business rules)
 */
export function validateExpenseData(data: { title?: string; amount?: number }): { valid: boolean; error?: string } {
  if (!data.title || !data.title.trim()) {
    return { valid: false, error: 'Title is required' }
  }
  if (!data.amount || data.amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' }
  }
  return { valid: true }
}

/**
 * Validates expense ID (business rule)
 */
export function validateExpenseId(id: string | undefined): boolean {
  return !!(id && typeof id === 'string')
}

