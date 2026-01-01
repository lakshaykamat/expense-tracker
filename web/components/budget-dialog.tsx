'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, Calendar } from 'lucide-react'
import type { BudgetDialogProps } from '@/types'
import { useBudgetForm } from '@/hooks/useBudgetForm'
import { formatCurrency } from '@/utils/currency.utils'

export function BudgetDialog({ 
  onSubmit, 
  children, 
  open, 
  onOpenChange, 
  editingBudget 
}: BudgetDialogProps) {
  const {
    formData,
    newItemName,
    newItemAmount,
    totalBudget,
    isSubmitDisabled,
    setNewItemName,
    setNewItemAmount,
    handleSubmit,
    addEssentialItem,
    removeEssentialItem,
    setFormDataMonth
  } = useBudgetForm({ editingBudget, onSubmit, open })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] w-full p-0 max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
        <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-border/10 shrink-0 bg-background">
          <DialogTitle className="text-lg md:text-xl font-semibold text-foreground pr-8">
            {editingBudget ? 'Edit Budget' : 'Create Budget'}
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-muted-foreground">
            Set your monthly budget and essential items
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 space-y-4 md:space-y-5 overflow-y-auto flex-1 min-h-0">
            <div className="space-y-2 md:space-y-3">
              <Label htmlFor="month" className="text-sm font-medium text-foreground">
                Month <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <Calendar className="w-4 h-4" />
                </div>
                <Input
                  id="month"
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormDataMonth(e.target.value)}
                  required
                  className="h-10 md:h-11 text-sm md:text-base pl-10"
                />
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                  Essential Items
                </Label>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Total: {formatCurrency(totalBudget)}
                </div>
              </div>

              {/* Add new essential item */}
              <div className="flex gap-2">
                <Input
                  placeholder="Item name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1 h-9 md:h-10 text-sm md:text-base"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEssentialItem())}
                />
                <div className="relative">
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none text-sm md:text-base">
                    ₹
                  </div>
                  <Input
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    className="w-32 md:w-36 h-9 md:h-10 text-sm md:text-base pl-6 pr-2"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEssentialItem())}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addEssentialItem}
                  size="sm"
                  className="h-9 md:h-10 px-2 md:px-3 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Essential items list */}
              {formData.essentialItems && formData.essentialItems.length > 0 ? (
                <div className="space-y-2 max-h-32 md:max-h-40 overflow-y-auto">
                  {formData.essentialItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.name}</div>
                        {item.amount && (
                          <div className="text-xs md:text-sm text-muted-foreground">
                            {formatCurrency(item.amount)}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEssentialItem(index)}
                        className="h-7 w-7 md:h-8 md:w-8 p-0 shrink-0"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 md:py-4 border-2 border-dashed border-muted rounded-md">
                  <div className="text-xs md:text-sm text-muted-foreground">
                    No essential items added yet
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Add items above to get started
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="px-4 md:px-6 pb-4 md:pb-6 pt-4 border-t border-border/10 shrink-0 bg-background">
            <Button 
              type="submit" 
              disabled={isSubmitDisabled}
              className="w-full h-10 md:h-11 text-sm md:text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {editingBudget ? 'Update Budget' : 'Create Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
