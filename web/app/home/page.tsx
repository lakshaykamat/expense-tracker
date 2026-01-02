'use client'

import React, { lazy, Suspense } from 'react'
import { ExpenseList } from '@/components/expense-list'
import { FabButton } from '@/components/fab-button'
import { PageLayout } from '@/components/page-layout'
import { useExpenses } from '@/hooks/useExpenses'
import { useExpenseDialog } from '@/hooks/useExpenseDialog'
import { useExpenseHandlers } from '@/hooks/useExpenseHandlers'
import { Spinner } from '@/components/ui/spinner'
import { getCurrentMonth } from '@/utils/date.utils'

// Lazy load dialog component (only loads when needed)
const ExpenseDialog = lazy(() => import('@/components/expense-dialog').then(module => ({ default: module.ExpenseDialog })))

export const dynamic = "force-dynamic";

export default function HomePage() {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(getCurrentMonth())
  const expensesHook = useExpenses(selectedMonth)
  const { expenses, loading, error, fetchExpenses, availableMonths } = expensesHook
  
  const dialogHook = useExpenseDialog()
  const { isDialogOpen, editingExpense, openAddDialog, openEditDialog, setIsDialogOpen } = dialogHook
  
  const { handleAddExpense, handleUpdateExpense, handleDeleteExpense } = useExpenseHandlers({
    expenses: expensesHook,
    dialog: dialogHook,
    selectedMonth: selectedMonth
  })

  if (loading && expenses.length === 0) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center w-full" style={{ minHeight: 'calc(100vh - 8rem)' }}>
          <Spinner size="lg" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <ExpenseList
        expenses={expenses}
        onDelete={handleDeleteExpense}
        onEdit={openEditDialog}
        onAddExpense={openAddDialog}
        isLoading={loading}
        error={error || undefined}
        onRetry={() => fetchExpenses(selectedMonth)}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        availableMonths={availableMonths}
      />

      <FabButton onClick={openAddDialog} />

      <Suspense fallback={null}>
        <ExpenseDialog
          onSubmit={handleAddExpense}
          open={isDialogOpen && !editingExpense}
          onOpenChange={setIsDialogOpen}
        />
      </Suspense>

      {editingExpense && (
        <Suspense fallback={null}>
          <ExpenseDialog
            onSubmit={handleUpdateExpense}
            open={isDialogOpen && !!editingExpense}
            onOpenChange={setIsDialogOpen}
            editingExpense={editingExpense}
          />
        </Suspense>
      )}
    </PageLayout>
  )
}
