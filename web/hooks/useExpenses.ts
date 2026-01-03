import { useState, useEffect, useCallback } from 'react'
import { Expense, CreateExpenseData, UseExpensesReturn } from '@/types'
import { expensesApi } from '@/lib/expenses-api'
import { getCurrentMonth, generateAvailableMonths } from '@/utils/date.utils'
import { isValidMonthFormat } from '@/utils/validation.utils'
import { extractErrorMessage, createInitialLoadingState, retryWithBackoff } from '@/helpers/api.helpers'
import { shouldIncludeInCurrentMonth, validateExpenseData, validateExpenseId } from '@/helpers/expense.helpers'

export function useExpenses(month?: string): UseExpensesReturn {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(() => createInitialLoadingState(month, isValidMonthFormat))
  const [error, setError] = useState<string | null>(null)
  const availableMonths = generateAvailableMonths(12)

  const fetchExpenses = useCallback(async (monthParam?: string) => {
    const monthToFetch = monthParam || month
    if (!monthToFetch || !isValidMonthFormat(monthToFetch)) {
      setExpenses([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await retryWithBackoff(() => expensesApi.getAll(monthToFetch))
      const fetchedExpenses = Array.isArray(response?.data) ? response.data : []
      setExpenses(fetchedExpenses)
    } catch (error: any) {
      setExpenses([])
      setError(extractErrorMessage(error, 'Failed to connect to server'))
    } finally {
      setLoading(false)
    }
  }, [month])

  const addExpense = useCallback(async (data: CreateExpenseData) => {
    const validation = validateExpenseData(data)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }
    
    try {
      const response = await expensesApi.create(data)
      if (response?.data) {
        const currentMonth = month || getCurrentMonth()
        if (shouldIncludeInCurrentMonth(data.date, currentMonth)) {
          setExpenses(prev => [response.data, ...prev])
        }
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: extractErrorMessage(error, 'Failed to create expense') }
    }
  }, [month])

  const updateExpense = useCallback(async (id: string, data: CreateExpenseData) => {
    if (!validateExpenseId(id)) {
      return { success: false, error: 'Invalid expense ID' }
    }
    
    const validation = validateExpenseData(data)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }
    
    try {
      const response = await expensesApi.update(id, data)
      if (response?.data) {
        setExpenses(prev => prev.map(expense => expense._id === id ? response.data : expense))
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: extractErrorMessage(error, 'Failed to update expense') }
    }
  }, [])

  const deleteExpense = useCallback(async (id: string) => {
    if (!validateExpenseId(id)) {
      return { success: false, error: 'Invalid expense ID' }
    }
    
    const originalExpenses = [...expenses]
    setExpenses(prev => prev.filter(expense => expense._id !== id))
    
    try {
      await expensesApi.delete(id)
      return { success: true }
    } catch (error: any) {
      setExpenses(originalExpenses)
      return { success: false, error: extractErrorMessage(error, 'Failed to delete expense') }
    }
  }, [expenses])

  // Fetch expenses when month prop changes
  useEffect(() => {
    if (month && isValidMonthFormat(month)) {
      fetchExpenses(month)
    } else {
      setExpenses([])
      setLoading(false)
    }
  }, [month, fetchExpenses])

  return {
    expenses,
    loading,
    error,
    availableMonths,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense
  }
}
