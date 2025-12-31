'use client'

import { useState, useEffect } from 'react'
import { Expense } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { PageHeader } from './page-header'
import { Trash2, Edit, RefreshCw, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { Spinner } from './ui/spinner'

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => void
  onEdit: (expense: Expense) => void
  onAddExpense?: () => void
  onRetry?: () => void
  isLoading?: boolean
  error?: string
}

export function ExpenseList({ 
  expenses, 
  onDelete, 
  onEdit, 
  onAddExpense,
  onRetry, 
  isLoading = false, 
  error 
}: ExpenseListProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  // Get available months from expenses
  const availableMonths = [...new Set(expenses.map(expense => 
    new Date(expense.date).toISOString().slice(0, 7)
  ))].sort((a, b) => b.localeCompare(a))

  // Auto-select current month if no selection
  useEffect(() => {
    if (!selectedMonth && availableMonths.length > 0) {
      const currentMonth = new Date().toISOString().slice(0, 7)
      setSelectedMonth(availableMonths.includes(currentMonth) ? currentMonth : availableMonths[0])
    }
  }, [availableMonths, selectedMonth])

  // Filter expenses by selected month
  const filteredExpenses = selectedMonth ? expenses.filter(expense => {
    const expenseMonth = new Date(expense.date).toISOString().slice(0, 7)
    return expenseMonth === selectedMonth
  }) : expenses

  // Sort expenses by date (latest first)
  const sortedExpenses = [...filteredExpenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
            <span className="text-red-600 text-lg">!</span>
          </div>
          <div className="text-gray-600">Something went wrong</div>
        </div>
      </div>
    )
  }

  if (sortedExpenses.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          buttonText="Add Expense"
          onButtonClick={onAddExpense}
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 gap-4">
            <p className="text-muted-foreground">Add your first expense to get started!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    // If amount is very small (like 0.1), show as 0
    if (amount < 1 && amount > 0) {
      return '₹0'
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        availableMonths={availableMonths}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        buttonText="Add Expense"
        onButtonClick={onAddExpense}
      />

      {/* Expense List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {sortedExpenses.map((expense) => (
            <div key={expense._id} className="px-6 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
              {/* Title and details on the left */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-light text-gray-900 truncate">{expense.title}</h3>
                  {expense.category && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
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

              {/* Edit/Delete buttons - show on hover */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(expense)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(expense._id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Amount on the far right */}
              <div className="text-right">
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