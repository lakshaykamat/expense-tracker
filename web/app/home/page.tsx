'use client'

import { ExpenseList } from '@/components/expense-list'
import { ExpenseDialog } from '@/components/expense-dialog'
import { FabButton } from '@/components/fab-button'
import { PageLayout } from '@/components/page-layout'
import { useExpenses } from '@/hooks/useExpenses'
import { useExpenseDialog } from '@/hooks/useExpenseDialog'
import { useExpenseHandlers } from '@/hooks/useExpenseHandlers'
import { useMonthSelection } from '@/hooks/useMonthSelection'
import { useBudgets } from '@/hooks/useBudgets'
import { Spinner } from '@/components/ui/spinner'

export default function HomePage() {
  const { budgets, currentBudget } = useBudgets()
  const { selectedMonth, setSelectedMonth, availableMonths } = useMonthSelection({
    budgets,
    currentBudget
  })
  const expensesHook = useExpenses(selectedMonth)
  const { expenses, loading, error, fetchExpenses } = expensesHook
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
        availableMonths={availableMonths}
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
