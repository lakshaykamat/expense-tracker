'use client'

import { CreateExpenseData } from '@/types'
import { ExpenseList } from '@/components/expense-list'
import { ExpenseDialog } from '@/components/expense-dialog'
import { FabButton } from '@/components/fab-button'
import { PageLayout } from '@/components/page-layout'
import { useExpenses } from '@/hooks/useExpenses'
import { useExpenseDialog } from '@/hooks/useExpenseDialog'
import { Spinner } from '@/components/ui/spinner'

export default function HomePage() {
  const { expenses, loading, error, fetchExpenses, addExpense, updateExpense, deleteExpense } = useExpenses()
  const { isDialogOpen, editingExpense, openAddDialog, openEditDialog, closeDialog, setIsDialogOpen } = useExpenseDialog()

  const handleAddExpense = async (data: CreateExpenseData) => {
    const result = await addExpense(data)
    if (result.success) {
      closeDialog()
    }
  }

  const handleUpdateExpense = async (data: CreateExpenseData) => {
    if (!editingExpense) return
    
    const result = await updateExpense(editingExpense._id, data)
    if (result.success) {
      closeDialog()
    }
  }

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id)
  }

  const onEdit = (expense: any) => {
    openEditDialog(expense)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <PageLayout>
      <ExpenseList
        expenses={expenses}
        onDelete={handleDeleteExpense}
        onEdit={onEdit}
        onAddExpense={openAddDialog}
        isLoading={loading}
        error={error || undefined}
        onRetry={fetchExpenses}
      />

      {/* Floating Action Button for Mobile */}
      <FabButton onClick={openAddDialog} />

      {/* Add Expense Dialog */}
      <ExpenseDialog
        onSubmit={handleAddExpense}
        open={isDialogOpen && !editingExpense}
        onOpenChange={setIsDialogOpen}
      >
        <div className="hidden" />
      </ExpenseDialog>

      {/* Edit Expense Dialog */}
      {editingExpense && (
        <ExpenseDialog
          onSubmit={handleUpdateExpense}
          open={isDialogOpen && !!editingExpense}
          onOpenChange={setIsDialogOpen}
          editingExpense={editingExpense}
        >
          <div className="hidden" />
        </ExpenseDialog>
      )}
    </PageLayout>
  )
}
