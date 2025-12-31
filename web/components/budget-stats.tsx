'use client'

import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BudgetStatsProps } from '@/types'

export function BudgetStats({ budget }: BudgetStatsProps) {
  if (!budget) {
    return (
      <div className="bg-muted/50 rounded-lg p-4 md:p-8 text-center">
        <div className="mx-auto w-10 h-10 md:w-12 md:h-12 bg-muted rounded-full flex items-center justify-center mb-3 md:mb-4">
          <Calendar className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
        </div>
        <h3 className="text-base md:text-lg font-medium text-foreground mb-2">No Budget Set</h3>
        <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 max-w-xs md:max-w-md mx-auto">
          Create a budget to start tracking your monthly expenses and essential items
        </p>
        <div className="space-y-1 md:space-y-2 text-xs text-muted-foreground hidden md:block">
          <p>• Set monthly budget limits</p>
          <p>• Add essential expense items</p>
          <p>• Track spending progress</p>
        </div>
      </div>
    )
  }

  const remaining = budget.totalBudget - budget.spentAmount
  const percentageUsed = budget.totalBudget > 0 ? (budget.spentAmount / budget.totalBudget) * 100 : 0
  const isOverBudget = remaining < 0
  const hasEssentialItems = budget.essentialItems && budget.essentialItems.length > 0

  const formatMonth = (monthString: string) => {
    const date = new Date(monthString + '-01')
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            {formatMonth(budget.month)}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Monthly Budget Overview
          </p>
        </div>
        <div className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
          isOverBudget 
            ? 'bg-destructive/10 text-destructive' 
            : percentageUsed > 80 
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
              : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          {isOverBudget ? 'Over Budget' : `${percentageUsed.toFixed(1)}% Used`}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {/* Total Budget */}
        <div className="bg-muted/50 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <span className="text-xs md:text-sm font-medium text-muted-foreground">Total Budget</span>
            <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
          </div>
          <div className="text-lg md:text-2xl font-bold text-foreground">
            ${budget.totalBudget.toFixed(2)}
          </div>
        </div>

        {/* Spent */}
        <div className="bg-muted/50 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <span className="text-xs md:text-sm font-medium text-muted-foreground">Spent</span>
            <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
          </div>
          <div className={`text-lg md:text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
            ${budget.spentAmount.toFixed(2)}
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-muted/50 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <span className="text-xs md:text-sm font-medium text-muted-foreground">Remaining</span>
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
          </div>
          <div className={`text-lg md:text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
            ${Math.abs(remaining).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 md:space-y-2">
        <div className="flex justify-between text-xs md:text-sm">
          <span className="text-muted-foreground">Budget Progress</span>
          <span className="text-muted-foreground">
            ${budget.spentAmount.toFixed(2)} / ${budget.totalBudget.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 md:h-2">
          <div
            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
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

      {/* Essential Items Section */}
      <div className="bg-muted/50 rounded-lg p-3 md:p-4">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <h4 className="text-xs md:text-sm font-medium text-foreground">Essential Items</h4>
          {hasEssentialItems && (
            <span className="text-xs text-muted-foreground">
              {budget.essentialItems.length} items
            </span>
          )}
        </div>
        
        {!hasEssentialItems ? (
          <div className="text-center py-3 md:py-4">
            <div className="mx-auto w-6 h-6 md:w-8 md:h-8 bg-muted rounded-full flex items-center justify-center mb-2">
              <Plus className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">No essential items yet</p>
            <p className="text-xs text-muted-foreground hidden md:block">
              Add essential items to track your must-have expenses
            </p>
          </div>
        ) : (
          <div className="space-y-1 md:space-y-2">
            {budget.essentialItems.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full"></div>
                  <span className="text-xs md:text-sm text-foreground truncate flex-1">{item.name}</span>
                </div>
                {item.amount && (
                  <span className="text-xs md:text-sm font-medium text-foreground ml-2">
                    ${item.amount.toFixed(2)}
                  </span>
                )}
              </div>
            ))}
            {budget.essentialItems.length > 5 && (
              <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                +{budget.essentialItems.length - 5} more items
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
