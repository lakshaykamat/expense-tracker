'use client'

import React, { lazy, Suspense, useState } from 'react'
import {
  ExpenseList,
  DeleteExpenseDialog,
  useExpenses,
  useExpenseDialog,
  useExpenseHandlers,
  useDeleteExpenseDialog,
  ExpenseListSkeleton,
} from '@/features/expenses'
import { PageLayout } from '@/shared/components/page-layout'
import { PageFab } from '@/shared/components/page-fab'
import { useMonthSelection } from '@/shared/hooks/use-month-selection'
import { Plus } from 'lucide-react'

// Lazy load dialog component (only loads when needed)
const ExpenseDialog = lazy(() => import('@/features/expenses').then(module => ({ default: module.ExpenseDialog })))

export const dynamic = "force-dynamic";

export default function HomePage() {
  const { selectedMonth, setSelectedMonth, availableMonths } = useMonthSelection()
  const expensesHook = useExpenses(selectedMonth)
  const { expenses, loading, error, fetchExpenses } = expensesHook

  const dialogHook = useExpenseDialog()
  const { isDialogOpen, editingExpense, openAddDialog, openEditDialog, setIsDialogOpen } = dialogHook

  const { handleAddExpense, handleUpdateExpense, handleDeleteExpense } = useExpenseHandlers({
    expenses: expensesHook,
    dialog: dialogHook,
  })
  const deleteDialog = useDeleteExpenseDialog(handleDeleteExpense)

  const [isSubmitting, setIsSubmitting] = useState(false)

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

  if (loading && expenses.length === 0) {
    return (
      <PageLayout>
        <ExpenseListSkeleton />
        <PageFab onClick={openAddDialog}>
          <Plus className="w-6 h-6" />
        </PageFab>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <ExpenseList
        expenses={expenses}
        onDelete={deleteDialog.openDeleteDialog}
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

      {deleteDialog.expenseToDelete && (
        <DeleteExpenseDialog
          open={deleteDialog.deleteDialogOpen}
          onOpenChange={deleteDialog.onOpenChange}
          onConfirm={deleteDialog.handleDeleteConfirm}
          isLoading={deleteDialog.isDeleting}
          expenseTitle={deleteDialog.expenseToDelete.title}
        />
      )}

      <PageFab onClick={openAddDialog}>
        <Plus className="w-6 h-6" />
      </PageFab>
    </PageLayout>
  )
}
