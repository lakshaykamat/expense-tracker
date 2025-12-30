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
import { CreateExpenseData, ExpenseDialogProps } from '@/types'
import { Plus } from 'lucide-react'
import { CategoryInput } from './category-input'
import { useCategories } from '@/hooks/useCategories'

export function ExpenseDialog({ onSubmit, children, open: controlledOpen, onOpenChange }: ExpenseDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const { allCategories, addCustomCategory } = useCategories()
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const [formData, setFormData] = useState<CreateExpenseData>({
    title: '',
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || formData.amount <= 0) return
    
    onSubmit(formData)
    setFormData({
      title: '',
      amount: 0,
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    })
    setOpen(false)
    setShowAdvanced(false)
  }

  const handleChange = (field: keyof CreateExpenseData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev: CreateExpenseData) => ({
      ...prev,
      [field]: field === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value
    }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }))
  }

  const handleAddCategory = (category: string) => {
    addCustomCategory(category)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0">
        <DialogHeader className="px-6 pt-6 border-b border-border/10">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Add Expense
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter the details of your expense below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="px-6 space-y-5">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleChange('title')}
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
                    $
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={handleChange('amount')}
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
                  onAddCategory={handleAddCategory}
                />
              </div>
            </div>

            {/* Advanced Fields Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
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
                      onChange={handleChange('date')}
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
                      onChange={handleChange('description')}
                      placeholder="Add any additional notes or details..."
                      className="min-h-[100px] resize-none text-base"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="px-6 pb-6 pt-2">
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
