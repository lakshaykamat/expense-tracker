'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import type { Budget, CreateBudgetData } from '@/types'
import { useBudgetForm } from '../hooks/use-budget-form'
import { Spinner } from '@/shared/components/ui/spinner'
import { BudgetFormContent } from './budget-form-content'

interface BudgetDialogProps {
  onSubmit: (data: CreateBudgetData) => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  editingBudget?: Budget | null;
  defaultMonth?: string;
  isLoading?: boolean;
}

export function BudgetDialog({
  onSubmit,
  children,
  open,
  onOpenChange,
  editingBudget,
  defaultMonth,
  isLoading = false,
}: BudgetDialogProps) {
  const form = useBudgetForm({ editingBudget, onSubmit, open: open ?? false, defaultMonth })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] w-full p-0 max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
        <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-border/10 shrink-0 bg-background">
          <DialogTitle className="text-xl font-semibold text-foreground pr-8">
            {editingBudget ? 'Edit Budget' : 'Create Budget'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Set your monthly budget and essential items
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit} className="flex flex-col overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 overflow-y-auto flex-1 min-h-0">
            <BudgetFormContent
              formData={form.formData}
              newItemName={form.newItemName}
              newItemAmount={form.newItemAmount}
              totalBudget={form.totalBudget}
              setNewItemName={form.setNewItemName}
              setNewItemAmount={form.setNewItemAmount}
              setFormDataMonth={form.setFormDataMonth}
              addEssentialItem={form.addEssentialItem}
              removeEssentialItem={form.removeEssentialItem}
            />
          </div>
          <DialogFooter className="px-4 md:px-6 pb-4 md:pb-6 pt-4 border-t border-border/10 shrink-0 bg-background">
            <Button
              type="submit"
              disabled={form.isSubmitDisabled || isLoading}
              className="w-full h-10 md:h-11 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>{editingBudget ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                editingBudget ? 'Update Budget' : 'Create Budget'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
