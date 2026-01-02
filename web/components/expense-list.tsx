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
  onDelete: (id: string) => void
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
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {expenses.map((expense) => (
            <div key={expense._id} className="px-6 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-light text-gray-900 truncate">{expense.title}</h3>
                  {expense.category && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 shrink-0">
                      {expense.category}
                    </span>
                  )}
                </div>
                {expense.description && (
                  <p className="text-sm text-gray-500 truncate">
                    {expense.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(expense.date), 'MMM dd, yyyy')}
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
                    onClick={() => onDelete(expense._id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    aria-label="Delete expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-2xl font-light text-gray-900">
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