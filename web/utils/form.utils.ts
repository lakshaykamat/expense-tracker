/**
 * Form utility functions for validation and initialization
 */

import { CreateExpenseData, CreateBudgetData, Expense, Budget, EssentialItem } from '@/types'
import { getCurrentMonth } from './date.utils'

export function getInitialExpenseFormData(editingExpense?: Expense | null): CreateExpenseData {
  if (editingExpense) {
    return {
      title: editingExpense.title,
      amount: editingExpense.amount,
      description: editingExpense.description || '',
      category: editingExpense.category || '',
      date: new Date(editingExpense.date).toISOString().split('T')[0]
    }
  }
  
  return {
    title: '',
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  }
}

export function getInitialBudgetFormData(editingBudget?: Budget | null, defaultMonth?: string): CreateBudgetData {
  if (editingBudget) {
    return {
      month: editingBudget.month,
      essentialItems: [...editingBudget.essentialItems]
    }
  }
  
  return {
    month: defaultMonth || getCurrentMonth(),
    essentialItems: []
  }
}


export function calculateBudgetTotal(essentialItems: EssentialItem[]): number {
  return essentialItems.reduce((sum, item) => sum + (item.amount || 0), 0)
}

