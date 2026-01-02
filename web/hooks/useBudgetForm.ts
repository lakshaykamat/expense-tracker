import { useState, useEffect, useCallback } from 'react'
import { CreateBudgetData, Budget, EssentialItem } from '@/types'
import { getInitialBudgetFormData, calculateBudgetTotal } from '@/utils/form.utils'

interface UseBudgetFormOptions {
  editingBudget?: Budget | null
  onSubmit: (data: CreateBudgetData) => void
  open: boolean
  defaultMonth?: string
}

export function useBudgetForm({ editingBudget, onSubmit, open, defaultMonth }: UseBudgetFormOptions) {
  const [formData, setFormData] = useState<CreateBudgetData>(getInitialBudgetFormData(editingBudget, defaultMonth))
  const [newItemName, setNewItemName] = useState('')
  const [newItemAmount, setNewItemAmount] = useState('')

  useEffect(() => {
    if (open) {
      const initialData = getInitialBudgetFormData(editingBudget, defaultMonth)
      setFormData(initialData)
      setNewItemName('')
      setNewItemAmount('')
    }
  }, [editingBudget, open, defaultMonth])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }, [formData, onSubmit])

  const addEssentialItem = useCallback(() => {
    if (!newItemName.trim()) return
    
    const item: EssentialItem = {
      name: newItemName.trim(),
      amount: newItemAmount ? parseFloat(newItemAmount) : undefined
    }
    
    setFormData(prev => ({
      ...prev,
      essentialItems: [...(prev.essentialItems || []), item]
    }))
    
    setNewItemName('')
    setNewItemAmount('')
  }, [newItemName, newItemAmount])

  const removeEssentialItem = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      essentialItems: prev.essentialItems?.filter((_, i) => i !== index) || []
    }))
  }, [])

  const totalBudget = calculateBudgetTotal(formData.essentialItems || [])
  const hasUnaddedItems = newItemName.trim() !== '' || newItemAmount.trim() !== ''
  const isSubmitDisabled = hasUnaddedItems

  return {
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
    setFormDataMonth: (month: string) => {
      setFormData(prev => ({ ...prev, month }))
    }
  }
}

