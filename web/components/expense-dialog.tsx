'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { ExpenseDialogProps } from '@/types'
import { Plus } from 'lucide-react'
import { CategoryInput } from './category-input'
import { useCategories } from '@/hooks/useCategories'
import { useExpenseForm } from '@/hooks/useExpenseForm'

export function ExpenseDialog({ onSubmit, children, open: controlledOpen, onOpenChange, editingExpense }: ExpenseDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const { allCategories } = useCategories()
  
  const {
    formData,
    showAdvanced,
    handleSubmit: handleFormSubmit,
    handleFieldChange,
    handleTextareaChange,
    handleCategoryChange,
    toggleAdvanced
  } = useExpenseForm({
    editingExpense,
    onSubmit,
    onClose: () => setOpen(false)
  })

  const handleSubmit = (e: React.FormEvent) => {
    handleFormSubmit(e)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          {children || (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[480px] p-0 max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/10 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {editingExpense ? 'Edit Expense' : 'Add Expense'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {editingExpense ? 'Update the details of your expense below' : 'Enter the details of your expense below'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="px-6 pt-4 space-y-5 overflow-y-auto flex-1 min-h-0">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleFieldChange('title')}
                placeholder="e.g., Coffee at Starbucks"
                required
                className="h-11 text-base"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                  Amount <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                    ₹
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    step="1"
                    min="0"
                    value={formData.amount || ''}
                    onChange={handleFieldChange('amount')}
                    placeholder="0.00"
                    required
                    className="h-11 text-base pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="category" className="text-sm font-medium text-foreground">
                  Category
                </Label>
                <CategoryInput
                  value={formData.category}
                  onChange={handleCategoryChange}
                  categories={allCategories}
                />
              </div>
            </div>

            {/* Advanced Fields Toggle */}
            <button
              type="button"
              onClick={toggleAdvanced}
              className="hover:cursor-pointer w-full text-sm text-muted-foreground hover:text-foreground font-medium transition-colors duration-200 flex items-start justify-start mb-2"
            >
              <span className="mr-2">{showAdvanced ? '−' : '+'}</span>
              {showAdvanced ? 'Hide' : 'Show'} optional fields
            </button>

            {/* Advanced Fields */}
            {showAdvanced && (
              <div className="space-y-4 pt-2 border-border animate-in slide-in-from-top duration-200">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="date" className="text-sm font-medium text-foreground">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={handleFieldChange('date')}
                      required
                      className="h-11 text-base"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-medium text-foreground">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={handleTextareaChange('description')}
                      placeholder="Add any additional notes or details..."
                      className="min-h-[100px] resize-none text-base"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="px-6 pb-4 sm:pb-6 pt-4 border-t border-border/10 flex-shrink-0 bg-background">
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
