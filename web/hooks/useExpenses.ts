import { useState, useEffect, useCallback } from 'react'
import { Expense, CreateExpenseData, UseExpensesReturn } from '@/types'
import { expensesApi } from '@/lib/expenses-api'
import { getCurrentMonth, getMonthFromDate } from '@/utils/date.utils'
import { isValidMonthFormat } from '@/utils/validation.utils'

export function useExpenses(month?: string): UseExpensesReturn {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableMonths, setAvailableMonths] = useState<string[]>([getCurrentMonth()])

  const fetchAvailableMonths = useCallback(async () => {
    try {
      const response = await expensesApi.getAll()
      const allExpenses = Array.isArray(response?.data) ? response.data : []
      const uniqueMonths = new Set<string>()
      
      allExpenses.forEach((expense: Expense) => {
        if (expense.date) {
          const expenseMonth = getMonthFromDate(expense.date)
          if (isValidMonthFormat(expenseMonth)) {
            uniqueMonths.add(expenseMonth)
          }
        }
      })
      
      const sortedMonths = Array.from(uniqueMonths).sort((a, b) => b.localeCompare(a))
      setAvailableMonths(sortedMonths.length > 0 ? sortedMonths : [getCurrentMonth()])
    } catch (error) {
      // If fetching all expenses fails, just use current month
      setAvailableMonths([getCurrentMonth()])
    }
  }, [])

  const fetchExpenses = useCallback(async (monthParam?: string) => {
    setLoading(true)
    setError(null)
    try {
      const monthToFetch = monthParam || month || getCurrentMonth()
      if (monthToFetch && !isValidMonthFormat(monthToFetch)) {
        throw new Error('Invalid month format')
      }
      const response = await expensesApi.getAll(monthToFetch)
      const fetchedExpenses = Array.isArray(response?.data) ? response.data : []
      setExpenses(fetchedExpenses)
      setError(null)
      
      // Update available months when expenses are fetched
      if (fetchedExpenses.length > 0) {
        const expenseMonth = getMonthFromDate(fetchedExpenses[0].date)
        if (isValidMonthFormat(expenseMonth)) {
          setAvailableMonths(prev => {
            const updated = new Set([...prev, expenseMonth])
            return Array.from(updated).sort((a, b) => b.localeCompare(a))
          })
        }
      }
    } catch (error: any) {
      setExpenses([])
      const errorMessage = error.response?.data?.message || error.message || 'Failed to connect to server'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [month])
  
  // Fetch expenses on mount and when month changes
  useEffect(() => {
    const monthToFetch = month || getCurrentMonth()
    if (monthToFetch && isValidMonthFormat(monthToFetch)) {
      fetchExpenses(monthToFetch)
    }
  }, [month, fetchExpenses])

  const addExpense = useCallback(async (data: CreateExpenseData) => {
    try {
      if (!data.title || !data.title.trim()) {
        return { success: false, error: 'Title is required' }
      }
      if (!data.amount || data.amount <= 0) {
        return { success: false, error: 'Amount must be greater than 0' }
      }
      
      const response = await expensesApi.create(data)
      if (response?.data) {
        const expenseMonth = getMonthFromDate(data.date || new Date())
        if (isValidMonthFormat(expenseMonth)) {
          setAvailableMonths(prev => {
            const updated = new Set([...prev, expenseMonth])
            return Array.from(updated).sort((a, b) => b.localeCompare(a))
          })
        }
        const currentMonth = month || getCurrentMonth()
        if (expenseMonth === currentMonth) {
          setExpenses(prev => [response.data, ...prev])
        }
      }
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create expense'
      return { success: false, error: errorMessage }
    }
  }, [month])

  const updateExpense = useCallback(async (id: string, data: CreateExpenseData) => {
    try {
      if (!id || typeof id !== 'string') {
        return { success: false, error: 'Invalid expense ID' }
      }
      if (!data.title || !data.title.trim()) {
        return { success: false, error: 'Title is required' }
      }
      if (data.amount !== undefined && data.amount <= 0) {
        return { success: false, error: 'Amount must be greater than 0' }
      }
      
      const response = await expensesApi.update(id, data)
      if (response?.data) {
        setExpenses(prev => 
          prev.map(expense => 
            expense._id === id ? response.data : expense
          )
        )
      }
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update expense'
      return { success: false, error: errorMessage }
    }
  }, [])

  const deleteExpense = useCallback(async (id: string) => {
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'Invalid expense ID' }
    }
    
    const expenseToDelete = expenses.find(e => e._id === id)
    const originalExpenses = [...expenses]
    setExpenses(prev => prev.filter(expense => expense._id !== id))
    
    try {
      await expensesApi.delete(id)
      
      // Refresh available months after deletion to ensure accuracy
      fetchAvailableMonths()
      
      return { success: true }
    } catch (error: any) {
      setExpenses(originalExpenses)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete expense'
      return { success: false, error: errorMessage }
    }
  }, [expenses, fetchAvailableMonths])

  useEffect(() => {
    fetchAvailableMonths()
  }, [fetchAvailableMonths])

  // Fetch expenses when month prop changes
  useEffect(() => {
    const monthToFetch = month || getCurrentMonth()
    if (monthToFetch && isValidMonthFormat(monthToFetch)) {
      fetchExpenses(monthToFetch)
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
