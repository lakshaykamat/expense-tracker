import { useCallback } from 'react'
import { CreateBudgetData, Budget, EssentialItem } from '@/types'
import { UseBudgetsReturn } from '@/types'
import { UseBudgetDialogReturn } from '@/types'

interface UseBudgetHandlersOptions {
  budgets: UseBudgetsReturn
  dialog: UseBudgetDialogReturn
}

export function useBudgetHandlers({ budgets, dialog }: UseBudgetHandlersOptions) {
  const { budgets: budgetsList, updateBudget, addBudget, deleteBudget, fetchBudgets } = budgets
  const { editingBudget, closeDialog } = dialog

  const handleBudgetSubmit = useCallback(async (data: CreateBudgetData) => {
    const result = editingBudget
      ? await updateBudget(editingBudget._id, data)
      : await addBudget(data)

    if (result.success) {
      closeDialog()
      await fetchBudgets()
    }
  }, [editingBudget, updateBudget, addBudget, closeDialog, fetchBudgets])

  const handleEditBudget = useCallback((budget: Budget) => {
    dialog.openEditDialog(budget)
  }, [dialog])

  const handleDeleteBudget = useCallback(async (id: string) => {
    const result = await deleteBudget(id)
    if (result.success) {
      await fetchBudgets()
    }
  }, [deleteBudget, fetchBudgets])

  const handleUpdateItem = useCallback(async (budgetId: string, itemName: string, amount: number) => {
    const budget = budgetsList.find(b => b._id === budgetId)
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
    await fetchBudgets()
  }, [budgetsList, updateBudget, fetchBudgets])

  const handleDeleteItem = useCallback(async (budgetId: string, itemName: string) => {
    const budget = budgetsList.find(b => b._id === budgetId)
    if (!budget) return

    const updatedBudget: CreateBudgetData = {
      ...budget,
      essentialItems: budget.essentialItems.filter(item => item.name !== itemName)
    }

    await updateBudget(budgetId, updatedBudget)
    await fetchBudgets()
  }, [budgetsList, updateBudget, fetchBudgets])

  return {
    handleBudgetSubmit,
    handleEditBudget,
    handleDeleteBudget,
    handleUpdateItem,
    handleDeleteItem
  }
}

