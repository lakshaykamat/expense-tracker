import { useState, useEffect, useCallback } from 'react'
import { getCurrentMonth, generateAvailableMonths } from '@/utils/date.utils'
import { Budget } from '@/types'
import { isValidMonthFormat } from '@/utils/validation.utils'

interface UseMonthSelectionOptions {
  initialMonth?: string
  budgets?: Budget[]
  currentBudget?: Budget | null
}

export function useMonthSelection(options: UseMonthSelectionOptions = {}) {
  const { initialMonth, budgets = [], currentBudget } = options
  const currentMonth = getCurrentMonth()
  const [initialized, setInitialized] = useState(false)
  
  // Get available months from budgets (only months with budgets)
  const availableMonths = budgets.length > 0
    ? budgets.map(b => b.month).filter(month => isValidMonthFormat(month)).sort((a, b) => b.localeCompare(a))
    : []
  
  // Get latest month with data
  const getLatestMonth = useCallback(() => {
    if (initialMonth && isValidMonthFormat(initialMonth)) {
      return initialMonth
    }
    if (availableMonths.length > 0) {
      return availableMonths[0] // Latest month (first in sorted descending array)
    }
    if (currentBudget?.month && isValidMonthFormat(currentBudget.month)) {
      return currentBudget.month
    }
    return currentMonth
  }, [initialMonth, availableMonths, currentBudget, currentMonth])
  
  const [selectedMonth, setSelectedMonth] = useState<string>('')

  const setSelectedMonthSafe = useCallback((month: string) => {
    if (isValidMonthFormat(month)) {
      setSelectedMonth(month)
    }
  }, [])

  // Initialize with latest month on first load only
  useEffect(() => {
    if (!initialized && (availableMonths.length > 0 || currentBudget)) {
      const latestMonth = getLatestMonth()
      if (latestMonth) {
        setSelectedMonth(latestMonth)
        setInitialized(true)
      }
    }
  }, [availableMonths, currentBudget, getLatestMonth, initialized])

  return {
    selectedMonth: selectedMonth || currentMonth,
    setSelectedMonth: setSelectedMonthSafe,
    availableMonths,
    currentMonth
  }
}

