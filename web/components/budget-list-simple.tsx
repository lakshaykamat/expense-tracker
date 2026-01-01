'use client'

import type { Budget } from '@/types'
import { Spinner } from './ui/spinner'

interface SimpleBudgetListProps {
  budgets: Budget[]
  loading: boolean
  error?: string
}

export function SimpleBudgetList({ budgets, loading, error }: SimpleBudgetListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (budgets.length === 0) {
    return <div>No budgets found</div>
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => (
        <div key={budget._id} className="border rounded-lg p-4">
          <h3 className="font-semibold">{budget.month}</h3>
          <p>Total Budget: ${budget.totalBudget}</p>
          <p>Spent: ${budget.spentAmount}</p>
          <p>Essential Items: {budget.essentialItems.length}</p>
          <div className="mt-2">
            {budget.essentialItems.map((item, index) => (
              <div key={index} className="text-sm">
                • {item.name}: ${item.amount || 0}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
