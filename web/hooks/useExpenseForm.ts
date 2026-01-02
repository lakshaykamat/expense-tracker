import { useState, useEffect, useCallback } from 'react'
import { CreateExpenseData, Expense } from '@/types'
import { getInitialExpenseFormData } from '@/utils/form.utils'
import { validateExpenseData } from '@/helpers/expense.helpers'

interface UseExpenseFormOptions {
  editingExpense?: Expense | null
  onSubmit: (data: CreateExpenseData) => void
  onClose?: () => void
}

export function useExpenseForm({ editingExpense, onSubmit, onClose }: UseExpenseFormOptions) {
  const [formData, setFormData] = useState<CreateExpenseData>(getInitialExpenseFormData(editingExpense))
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    const initialData = getInitialExpenseFormData(editingExpense)
    setFormData(initialData)
    setShowAdvanced(!!(editingExpense?.description || editingExpense?.category))
  }, [editingExpense])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validateExpenseData(formData)
    if (!validation.valid) {
      return
    }
    
    onSubmit(formData)
    
    const resetData = getInitialExpenseFormData()
    setFormData(resetData)
    setShowAdvanced(false)
    onClose?.()
  }, [formData, onSubmit, onClose])

  const handleFieldChange = useCallback((field: keyof CreateExpenseData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value
    }))
  }, [])

  const handleTextareaChange = useCallback((field: keyof CreateExpenseData) => (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }, [])

  const handleCategoryChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, category: value }))
  }, [])

  const toggleAdvanced = useCallback(() => {
    setShowAdvanced(prev => !prev)
  }, [])

  return {
    formData,
    showAdvanced,
    handleSubmit,
    handleFieldChange,
    handleTextareaChange,
    handleCategoryChange,
    toggleAdvanced
  }
}

