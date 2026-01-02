'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ErrorDisplay } from '@/components/error-display'
import { MoreHorizontal, Edit, Trash2, Calendar, DollarSign } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { BudgetListProps, Budget } from '@/types'

export function BudgetList({ budgets, onDelete, onEdit, isLoading, error, onRetry }: BudgetListProps) {
  const formatMonth = (monthString: string) => {
    const date = new Date(monthString + '-01')
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-32"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </div>
                <div className="h-8 bg-muted rounded w-8"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8">
        <ErrorDisplay
          error={error}
          title="Error loading budgets"
          onRetry={onRetry}
          variant="compact"
        />
      </Card>
    )
  }

  if (budgets.length === 0) {
    return (
      <Card className="text-center p-8">
        <div className="space-y-4">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Budgets Yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first budget to start tracking your monthly expenses
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const remaining = budget.totalBudget - budget.spentAmount
        const percentageUsed = budget.totalBudget > 0 ? (budget.spentAmount / budget.totalBudget) * 100 : 0
        const isOverBudget = remaining < 0

        return (
          <Card key={budget._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {formatMonth(budget.month)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {budget.essentialItems.length} essential items
                      </p>
                    </div>
                    <Badge
                      variant={isOverBudget ? 'destructive' : percentageUsed > 80 ? 'secondary' : 'default'}
                    >
                      {isOverBudget ? 'Over Budget' : `${percentageUsed.toFixed(1)}% Used`}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {formatCurrency(budget.totalBudget)}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Budget</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                        {formatCurrency(budget.spentAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground">Spent</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                        {formatCurrency(Math.abs(remaining))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isOverBudget ? 'Over' : 'Remaining'}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isOverBudget 
                            ? 'bg-destructive' 
                            : percentageUsed > 80 
                              ? 'bg-orange-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Essential Items Preview */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-foreground">Essential Items:</div>
                    {budget.essentialItems && budget.essentialItems.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {budget.essentialItems.slice(0, 5).map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {item.name}
                            {item.amount && ` (${formatCurrency(item.amount)})`}
                          </Badge>
                        ))}
                        {budget.essentialItems.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{budget.essentialItems.length - 5} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        No essential items added yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(budget)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(budget._id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
