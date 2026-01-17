'use client'

import React, { lazy, Suspense, useState } from 'react'
import { ExpenseList } from '@/components/expense-list'
import { PageLayout } from '@/components/page-layout'
import { useExpenses } from '@/hooks/useExpenses'
import { useExpenseDialog } from '@/hooks/useExpenseDialog'
import { useExpenseHandlers } from '@/hooks/useExpenseHandlers'
import { useMonthSelection } from '@/hooks/useMonthSelection'
import { DeleteExpenseDialog } from '@/components/delete-expense-dialog'
import { ExpenseListSkeleton } from '@/components/expense-list-skeleton'
import type { Expense } from '@/types'

// Lazy load dialog component (only loads when needed)
const ExpenseDialog = lazy(() => import('@/components/expense-dialog').then(module => ({ default: module.ExpenseDialog })))

export const dynamic = "force-dynamic";

export default function HomePage() {
  const { selectedMonth, setSelectedMonth, availableMonths } = useMonthSelection()
  const expensesHook = useExpenses(selectedMonth)
  const { expenses, loading, error, fetchExpenses } = expensesHook
  
  const dialogHook = useExpenseDialog()
  const { isDialogOpen, editingExpense, openAddDialog, openEditDialog, setIsDialogOpen } = dialogHook
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { handleAddExpense, handleUpdateExpense, handleDeleteExpense } = useExpenseHandlers({
    expenses: expensesHook,
    dialog: dialogHook,
  })

  const handleAddExpenseWithLoading = async (data: any) => {
    setIsSubmitting(true)
    await handleAddExpense(data)
    setIsSubmitting(false)
  }

  const handleUpdateExpenseWithLoading = async (data: any) => {
    setIsSubmitting(true)
    await handleUpdateExpense(data)
    setIsSubmitting(false)
  }

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete || isDeleting) return
    
    setIsDeleting(true)
    await handleDeleteExpense(expenseToDelete._id)
    setIsDeleting(false)
    setDeleteDialogOpen(false)
    setExpenseToDelete(null)
  }

  const handleDeleteDialogClose = (open: boolean) => {
    if (!open && !isDeleting) {
      setDeleteDialogOpen(false)
      setExpenseToDelete(null)
    }
  }

  if (loading && expenses.length === 0) {
    return (
      <PageLayout>
        <ExpenseListSkeleton />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <ExpenseList
        expenses={expenses}
        onDelete={handleDeleteClick}
        onEdit={openEditDialog}
        onAddExpense={openAddDialog}
        isLoading={loading}
        error={error || undefined}
        onRetry={() => fetchExpenses(selectedMonth)}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        availableMonths={availableMonths}
      />

      <Suspense fallback={null}>
        <ExpenseDialog
          onSubmit={handleAddExpenseWithLoading}
          open={isDialogOpen && !editingExpense}
          onOpenChange={setIsDialogOpen}
          isLoading={isSubmitting}
        />
      </Suspense>

      {editingExpense && (
        <Suspense fallback={null}>
          <ExpenseDialog
            onSubmit={handleUpdateExpenseWithLoading}
            open={isDialogOpen && !!editingExpense}
            onOpenChange={setIsDialogOpen}
            editingExpense={editingExpense}
            isLoading={isSubmitting}
          />
        </Suspense>
      )}

      {expenseToDelete && (
        <DeleteExpenseDialog
          open={deleteDialogOpen}
          onOpenChange={handleDeleteDialogClose}
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleting}
          expenseTitle={expenseToDelete.title}
        />
      )}
    </PageLayout>
  )
}
