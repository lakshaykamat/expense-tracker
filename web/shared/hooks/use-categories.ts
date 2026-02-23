import { useState, useEffect } from 'react'
import { EXPENSE_CATEGORIES } from '@/constants'

const CUSTOM_CATEGORIES_KEY = 'expense_custom_categories'

export function useCategories() {
  const [customCategories, setCustomCategories] = useState<string[]>([])

  useEffect(() => {
    // Load custom categories from localStorage on mount
    const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY)
    if (stored) {
      try {
        setCustomCategories(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to load custom categories:', error)
      }
    }
  }, [])

  const getAllCategories = () => {
    return [...new Set([...EXPENSE_CATEGORIES, ...customCategories])]
  }

  const addCustomCategory = (category: string) => {
    const trimmed = category.trim()
    if (!trimmed || customCategories.includes(trimmed)) {
      return false
    }

    const updated = [...customCategories, trimmed]
    setCustomCategories(updated)
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated))
    return true
  }

  const removeCustomCategory = (category: string) => {
    const updated = customCategories.filter(cat => cat !== category)
    setCustomCategories(updated)
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated))
  }

  return {
    customCategories,
    allCategories: getAllCategories(),
    addCustomCategory,
    removeCustomCategory
  }
}
