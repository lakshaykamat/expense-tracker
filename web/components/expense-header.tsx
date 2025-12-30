'use client'

import { Button } from './ui/button'
import { ExpenseDialog } from './expense-dialog'
import { ExpenseHeaderProps } from '@/types'
import { Plus } from 'lucide-react'

export function ExpenseHeader({ 
  onAddExpense, 
  isDialogOpen, 
  onDialogOpenChange 
}: ExpenseHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="text-left">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Expense Tracker</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your daily expenses</p>
        </div>
        <div className="hidden sm:flex justify-end">
          <ExpenseDialog onSubmit={onAddExpense} open={isDialogOpen} onOpenChange={onDialogOpenChange}>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </ExpenseDialog>
        </div>
      </div>
    </div>
  )
}
