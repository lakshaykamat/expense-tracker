'use client'

import React from 'react'
import { ExpenseList } from '@/components/expense-list'
import { ExpenseDialog } from '@/components/expense-dialog'
import { FabButton } from '@/components/fab-button'
import { PageLayout } from '@/components/page-layout'
import { useExpenses } from '@/hooks/useExpenses'
import { useExpenseDialog } from '@/hooks/useExpenseDialog'
import { useExpenseHandlers } from '@/hooks/useExpenseHandlers'
import { Spinner } from '@/components/ui/spinner'
import { getCurrentMonth } from '@/utils/date.utils'
import { isValidMonthFormat } from '@/utils/validation.utils'

export default function HomePage() {
  const [initialized, setInitialized] = React.useState(false)
  const [selectedMonth, setSelectedMonth] = React.useState<string | null>(null)
  const expensesHook = useExpenses(selectedMonth || undefined)
  const { expenses, loading, error, fetchExpenses, availableMonths: expenseMonths } = expensesHook
  
  // Initialize with latest month on first load
  React.useEffect(() => {
    if (!initialized) {
      if (expenseMonths.length > 0) {
        const latestMonth = expenseMonths[0]
        setSelectedMonth(latestMonth)
        setInitialized(true)
      } else if (!loading) {
        // No expenses exist or API call completed, set to current month
        setSelectedMonth(getCurrentMonth())
        setInitialized(true)
      }
    }
  }, [expenseMonths, initialized, loading])
  const dialogHook = useExpenseDialog()
  const { isDialogOpen, editingExpense, openAddDialog, openEditDialog, setIsDialogOpen } = dialogHook
  
  const { handleAddExpense, handleUpdateExpense, handleDeleteExpense } = useExpenseHandlers({
    expenses: expensesHook,
    dialog: dialogHook,
    selectedMonth: selectedMonth || getCurrentMonth()
  })

  if (!initialized || (loading && expenses.length === 0)) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
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
        onRetry={() => selectedMonth && fetchExpenses(selectedMonth)}
        selectedMonth={selectedMonth || getCurrentMonth()}
        onMonthChange={setSelectedMonth}
        availableMonths={expenseMonths}
      />

      <FabButton onClick={openAddDialog} />

      <ExpenseDialog
        onSubmit={handleAddExpense}
        open={isDialogOpen && !editingExpense}
        onOpenChange={setIsDialogOpen}
      />

      {editingExpense && (
        <ExpenseDialog
          onSubmit={handleUpdateExpense}
          open={isDialogOpen && !!editingExpense}
          onOpenChange={setIsDialogOpen}
          editingExpense={editingExpense}
        />
      )}
    </PageLayout>
  )
}
