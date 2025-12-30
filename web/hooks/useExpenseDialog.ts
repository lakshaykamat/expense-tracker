import { useState } from 'react'
import { Expense, UseExpenseDialogReturn } from '@/types'

export function useExpenseDialog(): UseExpenseDialogReturn {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const openAddDialog = () => {
    setEditingExpense(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingExpense(null)
  }

  return {
    isDialogOpen,
    editingExpense,
    openAddDialog,
    openEditDialog,
    closeDialog,
    setIsDialogOpen
  }
}
