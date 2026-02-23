import { useState, useCallback } from 'react'
import type { Budget, UseBudgetDialogReturn } from '@/types'

export function useBudgetDialog(): UseBudgetDialogReturn {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  const openAddDialog = useCallback(() => {
    setEditingBudget(null)
    setIsDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((budget: Budget) => {
    setEditingBudget(budget)
    setIsDialogOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
    setEditingBudget(null)
  }, [])

  return {
    isDialogOpen,
    editingBudget,
    openAddDialog,
    openEditDialog,
    closeDialog,
    setIsDialogOpen
  }
}
