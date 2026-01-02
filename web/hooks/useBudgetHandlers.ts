import { useCallback } from 'react'
import { CreateBudgetData, Budget, EssentialItem } from '@/types'
import { UseBudgetsReturn } from '@/types'
import { UseBudgetDialogReturn } from '@/types'

interface UseBudgetHandlersOptions {
  budgets: UseBudgetsReturn
  dialog: UseBudgetDialogReturn
}

export function useBudgetHandlers({ budgets, dialog }: UseBudgetHandlersOptions) {
  const { currentBudget, updateBudget, addBudget, deleteBudget, fetchBudgetByMonth } = budgets
  const { editingBudget, closeDialog } = dialog

  const handleBudgetSubmit = useCallback(async (data: CreateBudgetData) => {
    const result = editingBudget
      ? await updateBudget(editingBudget._id, data)
      : await addBudget(data)

    if (result.success) {
      closeDialog()
      // Refetch budget for the month that was just modified
      if (data.month) {
        await fetchBudgetByMonth(data.month)
      } else if (editingBudget?.month) {
        await fetchBudgetByMonth(editingBudget.month)
      }
    }
  }, [editingBudget, updateBudget, addBudget, closeDialog, fetchBudgetByMonth])

  const handleEditBudget = useCallback((budget: Budget) => {
    dialog.openEditDialog(budget)
  }, [dialog])

  const handleDeleteBudget = useCallback(async (id: string) => {
    const budgetToDelete = currentBudget?._id === id ? currentBudget : null
    const month = budgetToDelete?.month
    const result = await deleteBudget(id)
    if (result.success && month) {
      await fetchBudgetByMonth(month)
    }
  }, [currentBudget, deleteBudget, fetchBudgetByMonth])

  const handleUpdateItem = useCallback(async (budgetId: string, itemName: string, amount: number) => {
    const budget = currentBudget?._id === budgetId ? currentBudget : null
    if (!budget) return

    const updatedBudget: CreateBudgetData = {
      ...budget,
      essentialItems: budget.essentialItems.map(item =>
        item.name === itemName
          ? { ...item, amount }
          : item
      )
    }

    await updateBudget(budgetId, updatedBudget)
    if (budget.month) {
      await fetchBudgetByMonth(budget.month)
    }
  }, [currentBudget, updateBudget, fetchBudgetByMonth])

  const handleDeleteItem = useCallback(async (budgetId: string, itemName: string) => {
    const budget = currentBudget?._id === budgetId ? currentBudget : null
    if (!budget) return

    const updatedBudget: CreateBudgetData = {
      ...budget,
      essentialItems: budget.essentialItems.filter(item => item.name !== itemName)
    }

    await updateBudget(budgetId, updatedBudget)
    if (budget.month) {
      await fetchBudgetByMonth(budget.month)
    }
  }, [currentBudget, updateBudget, fetchBudgetByMonth])

  return {
    handleBudgetSubmit,
    handleEditBudget,
    handleDeleteBudget,
    handleUpdateItem,
    handleDeleteItem
  }
}

