import { useCallback } from 'react'
import { CreateExpenseData } from '@/types'
import { UseExpensesReturn } from '@/types'
import { UseExpenseDialogReturn } from '@/types'

interface UseExpenseHandlersOptions {
  expenses: UseExpensesReturn
  dialog: UseExpenseDialogReturn
  selectedMonth: string
}

export function useExpenseHandlers({ expenses, dialog, selectedMonth }: UseExpenseHandlersOptions) {
  const { addExpense, updateExpense, deleteExpense, fetchExpenses } = expenses
  const { closeDialog } = dialog

  const handleAddExpense = useCallback(async (data: CreateExpenseData) => {
    const result = await addExpense(data)
    if (result.success) {
      closeDialog()
      fetchExpenses(selectedMonth)
    }
  }, [addExpense, closeDialog, fetchExpenses, selectedMonth])

  const handleUpdateExpense = useCallback(async (data: CreateExpenseData) => {
    if (!dialog.editingExpense) return
    
    const result = await updateExpense(dialog.editingExpense._id, data)
    if (result.success) {
      closeDialog()
    }
  }, [updateExpense, dialog.editingExpense, closeDialog])

  const handleDeleteExpense = useCallback(async (id: string) => {
    await deleteExpense(id)
  }, [deleteExpense])

  return {
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense
  }
}

