import { useState, useEffect, useCallback } from 'react'
import { budgetsApi } from '@/lib/budgets-api'
import type { Budget, CreateBudgetData, UpdateBudgetData, EssentialItem, UseBudgetsReturn } from '@/types'
import { isValidMonthFormat } from '@/utils/validation.utils'
import { extractErrorMessage, createInitialLoadingState } from '@/helpers/api.helpers'
import { shouldUpdateCurrentBudget, updateBudgetState, removeBudgetState } from '@/helpers/budget.helpers'

export function useBudgets(month?: string): UseBudgetsReturn {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null)
  const [loading, setLoading] = useState(() => createInitialLoadingState(month, isValidMonthFormat))
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await budgetsApi.getAll()
      setBudgets(data)
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to fetch budgets'))
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBudgetByMonth = useCallback(async (monthParam: string) => {
    if (!monthParam || !isValidMonthFormat(monthParam)) {
      setCurrentBudget(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await budgetsApi.getByMonth(monthParam)
      setCurrentBudget(data)
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to fetch budget'))
      setCurrentBudget(null)
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
      setError(extractErrorMessage(err, 'Failed to fetch current budget'))
    }
  }, [])


  const addBudget = useCallback(async (data: CreateBudgetData): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      const newBudget = await budgetsApi.create(data)
      setBudgets(prev => [newBudget, ...prev])
      
      if (shouldUpdateCurrentBudget(data.month)) {
        setCurrentBudget(newBudget)
      }
      
      return { success: true }
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Failed to create budget')
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const updateBudget = useCallback(async (id: string, data: UpdateBudgetData): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      const updatedBudget = await budgetsApi.update(id, data)
      const { budgets: newBudgets, currentBudget: newCurrentBudget } = updateBudgetState(budgets, updatedBudget, currentBudget, id)
      setBudgets(newBudgets)
      setCurrentBudget(newCurrentBudget)
      return { success: true }
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Failed to update budget')
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [budgets, currentBudget])

  const deleteBudget = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await budgetsApi.delete(id)
      const { budgets: newBudgets, currentBudget: newCurrentBudget } = removeBudgetState(budgets, currentBudget, id)
      setBudgets(newBudgets)
      setCurrentBudget(newCurrentBudget)
      return { success: true }
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Failed to delete budget')
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [budgets, currentBudget])

  const addEssentialItem = useCallback(async (budgetId: string, item: EssentialItem): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      const updatedBudget = await budgetsApi.addEssentialItem(budgetId, item)
      const { budgets: newBudgets, currentBudget: newCurrentBudget } = updateBudgetState(budgets, updatedBudget, currentBudget, budgetId)
      setBudgets(newBudgets)
      setCurrentBudget(newCurrentBudget)
      return { success: true }
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Failed to add essential item')
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [budgets, currentBudget])

  const removeEssentialItem = useCallback(async (budgetId: string, itemName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await budgetsApi.removeEssentialItem(budgetId, itemName)
      
      const updatedBudget = budgets.find(b => b._id === budgetId)
      if (!updatedBudget) {
        return { success: false, error: 'Budget not found' }
      }
      
      const newBudget = {
        ...updatedBudget,
        essentialItems: updatedBudget.essentialItems.filter(item => item.name !== itemName)
      }
      
      const { budgets: newBudgets, currentBudget: newCurrentBudget } = updateBudgetState(budgets, newBudget, currentBudget, budgetId)
      setBudgets(newBudgets)
      setCurrentBudget(newCurrentBudget)
      return { success: true }
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Failed to remove essential item')
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [budgets, currentBudget])

  // Fetch budget by month when month prop changes
  useEffect(() => {
    if (month && isValidMonthFormat(month)) {
      fetchBudgetByMonth(month)
    } else {
      setCurrentBudget(null)
      setLoading(false)
    }
  }, [month, fetchBudgetByMonth])

  return {
    budgets,
    currentBudget,
    loading,
    error,
    fetchBudgets,
    fetchCurrentBudget,
    fetchBudgetByMonth,
    addBudget,
    updateBudget,
    deleteBudget,
    addEssentialItem,
    removeEssentialItem
  }
}
