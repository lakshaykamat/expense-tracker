'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { BudgetHeaderProps } from '@/types'

export function BudgetHeader({ onAddBudget, isDialogOpen, onDialogOpenChange }: BudgetHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
        <p className="text-muted-foreground">
          Manage your monthly budgets and track essential expenses
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          onClick={onAddBudget}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </Button>
      </div>
    </div>
  )
}
