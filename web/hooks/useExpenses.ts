import { useState, useEffect } from 'react'
import { Expense, CreateExpenseData, UseExpensesReturn } from '@/types'
import { expensesApi } from '@/lib/expenses-api'

export function useExpenses(): UseExpensesReturn {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await expensesApi.getAll()
      setExpenses(response.data || [])
      setError(null)
    } catch (error: any) {
      console.error('Failed to fetch expenses:', error)
      setExpenses([])
      setError(error.response?.data?.message || error.message || 'Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const addExpense = async (data: CreateExpenseData) => {
    try {
      const response = await expensesApi.create(data)
      setExpenses(prev => [response.data, ...prev])
      return { success: true }
    } catch (error: any) {
      console.error('Failed to create expense:', error)
      return { success: false, error: error.message }
    }
  }

  const updateExpense = async (id: string, data: CreateExpenseData) => {
    try {
      const response = await expensesApi.update(id, data)
      setExpenses(prev => 
        prev.map(expense => 
          expense._id === id ? response.data : expense
        )
      )
      return { success: true }
    } catch (error: any) {
      console.error('Failed to update expense:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteExpense = async (id: string) => {
    // Optimistically remove from UI immediately
    const originalExpenses = expenses
    setExpenses(prev => prev.filter(expense => expense._id !== id))
    
    try {
      await expensesApi.delete(id)
      return { success: true }
    } catch (error: any) {
      console.error('Failed to delete expense:', error)
      // Restore original expenses if delete failed
      setExpenses(originalExpenses)
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense
  }
}
