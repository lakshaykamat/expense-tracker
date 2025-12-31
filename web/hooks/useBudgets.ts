import { useState, useEffect, useCallback } from 'react'
import { budgetsApi } from '@/lib/budgets-api'
import type { Budget, CreateBudgetData, UpdateBudgetData, EssentialItem, UseBudgetsReturn } from '@/types'

export function useBudgets(): UseBudgetsReturn {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await budgetsApi.getAll()
      setBudgets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budgets')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCurrentBudget = useCallback(async () => {
    try {
      setError(null)
      const data = await budgetsApi.getCurrent()
      setCurrentBudget(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch current budget')
    }
  }, [])


  const addBudget = useCallback(async (data: CreateBudgetData): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      const newBudget = await budgetsApi.create(data)
      setBudgets(prev => [newBudget, ...prev])
      
      // Update current budget if it's for current month
      const currentMonth = new Date().toISOString().slice(0, 7)
      if (data.month === currentMonth) {
        setCurrentBudget(newBudget)
      }
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create budget'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const updateBudget = useCallback(async (id: string, data: UpdateBudgetData): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      const updatedBudget = await budgetsApi.update(id, data)
      setBudgets(prev => prev.map(budget => budget._id === id ? updatedBudget : budget))
      
      // Update current budget if it matches
      if (currentBudget?._id === id) {
        setCurrentBudget(updatedBudget)
      }
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update budget'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [currentBudget])

  const deleteBudget = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await budgetsApi.delete(id)
      setBudgets(prev => prev.filter(budget => budget._id !== id))
      
      // Clear current budget if it matches
      if (currentBudget?._id === id) {
        setCurrentBudget(null)
      }
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete budget'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [currentBudget])

  const addEssentialItem = useCallback(async (budgetId: string, item: EssentialItem): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      const updatedBudget = await budgetsApi.addEssentialItem(budgetId, item)
      setBudgets(prev => prev.map(budget => budget._id === budgetId ? updatedBudget : budget))
      
      // Update current budget if it matches
      if (currentBudget?._id === budgetId) {
        setCurrentBudget(updatedBudget)
      }
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add essential item'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [currentBudget])

  const removeEssentialItem = useCallback(async (budgetId: string, itemName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await budgetsApi.removeEssentialItem(budgetId, itemName)
      
      // Update local state by removing the item
      setBudgets(prev => prev.map(budget => {
        if (budget._id === budgetId) {
          const updatedBudget = {
            ...budget,
            essentialItems: budget.essentialItems.filter(item => item.name !== itemName)
          }
          
          // Update current budget if it matches
          if (currentBudget?._id === budgetId) {
            setCurrentBudget(updatedBudget)
          }
          
          return updatedBudget
        }
        return budget
      }))
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove essential item'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [currentBudget])

  // Fetch budgets on mount
  useEffect(() => {
    fetchBudgets()
    fetchCurrentBudget()
  }, [fetchBudgets, fetchCurrentBudget])

  return {
    budgets,
    currentBudget,
    loading,
    error,
    fetchBudgets,
    fetchCurrentBudget,
    addBudget,
    updateBudget,
    deleteBudget,
    addEssentialItem,
    removeEssentialItem
  }
}
