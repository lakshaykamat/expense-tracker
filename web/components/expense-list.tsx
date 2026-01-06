'use client'

import { Expense } from '@/types'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { PageHeader } from './page-header'
import { Trash2, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { Spinner } from './ui/spinner'
import { formatCurrency } from '@/utils/currency.utils'
import { EmptyState } from './empty-state'
import { ErrorDisplay } from './error-display'

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (expense: Expense) => void
  onEdit: (expense: Expense) => void
  onAddExpense?: () => void
  onRetry?: () => void
  isLoading?: boolean
  error?: string
  selectedMonth: string
  onMonthChange: (month: string) => void
  availableMonths: string[]
}

export function ExpenseList({ 
  expenses, 
  onDelete, 
  onEdit, 
  onAddExpense,
  onRetry, 
  isLoading = false, 
  error,
  selectedMonth,
  onMonthChange,
  availableMonths
}: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
          buttonText="Add Expense"
          onButtonClick={onAddExpense}
        />
        <ErrorDisplay
          error={error}
          onRetry={onRetry}
          variant="default"
        />
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
          buttonText="Add Expense"
          onButtonClick={onAddExpense}
        />
        <EmptyState
          title="No expenses found"
          description="Add your first expense to get started!"
          icon={
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        availableMonths={availableMonths}
        selectedMonth={selectedMonth}
        onMonthChange={onMonthChange}
        buttonText="Add Expense"
        onButtonClick={onAddExpense}
      />

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {expenses.map((expense) => (
            <div key={expense._id} className="px-6 py-6 flex items-center justify-between hover:bg-muted/50 transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <h3 className="text-base font-light text-foreground truncate">{expense.title}</h3>
                </div>
                {expense.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {expense.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(expense.date), 'MMM d')}
                  {expense.category && (
                    <span className="ml-1">
                      {' '}· {expense.category.toUpperCase()}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(expense)}
                    className="h-8 w-8 p-0"
                    aria-label="Edit expense"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(expense)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Delete expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-base font-light text-foreground">
                  {formatCurrency(expense.amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}