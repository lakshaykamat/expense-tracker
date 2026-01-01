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

export default function HomePage() {
  const currentMonth = getCurrentMonth()
  const [selectedMonth, setSelectedMonth] = React.useState<string>(currentMonth)
  const expensesHook = useExpenses(selectedMonth)
  const { expenses, loading, error, fetchExpenses, availableMonths: expenseMonths } = expensesHook
  
  React.useEffect(() => {
    if (expenseMonths.length > 0) {
      if (!expenseMonths.includes(selectedMonth)) {
        setSelectedMonth(expenseMonths[0])
      }
    } else if (selectedMonth !== currentMonth) {
      setSelectedMonth(currentMonth)
    }
  }, [expenseMonths, currentMonth])
  
  React.useEffect(() => {
    if (selectedMonth) {
      fetchExpenses(selectedMonth)
    }
  }, [selectedMonth])
  const dialogHook = useExpenseDialog()
  const { isDialogOpen, editingExpense, openAddDialog, openEditDialog, setIsDialogOpen } = dialogHook
  
  const { handleAddExpense, handleUpdateExpense, handleDeleteExpense } = useExpenseHandlers({
    expenses: expensesHook,
    dialog: dialogHook,
    selectedMonth
  })

  if (loading && expenses.length === 0) {
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
        onRetry={() => fetchExpenses(selectedMonth)}
        selectedMonth={selectedMonth}
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
