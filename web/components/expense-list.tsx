'use client'

import { Expense } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Trash2, Edit, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => void
  onEdit: (expense: Expense) => void
  onRetry?: () => void
  isLoading?: boolean
  error?: string
}

export function ExpenseList({ 
  expenses, 
  onDelete, 
  onEdit, 
  onRetry, 
  isLoading = false, 
  error 
}: ExpenseListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <p className="text-muted-foreground">Loading expenses...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-32 gap-4">
          <p className="text-destructive">Failed to load expenses</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-32 gap-4">
          <p className="text-muted-foreground">No expenses yet</p>
          <p className="text-sm text-muted-foreground">Add your first expense to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <Card key={expense._id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{expense.title}</h3>
                  {expense.category && (
                    <span className="text-sm bg-muted px-2 py-1 rounded">
                      {expense.category}
                    </span>
                  )}
                </div>
                {expense.description && (
                  <p className="text-muted-foreground text-sm mb-2">
                    {expense.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {format(new Date(expense.date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold">
                  ${expense.amount.toFixed(2)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(expense)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(expense._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
