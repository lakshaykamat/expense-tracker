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
  
  const getValidInitialMonth = useCallback(() => {
    if (initialMonth && isValidMonthFormat(initialMonth)) {
      return initialMonth
    }
    return currentMonth
  }, [initialMonth, currentMonth])
  
  const [selectedMonth, setSelectedMonth] = useState<string>(getValidInitialMonth())

  const availableMonths = budgets.length > 0
    ? budgets.map(b => b.month).filter(month => isValidMonthFormat(month)).sort((a, b) => b.localeCompare(a))
    : generateAvailableMonths(12)

  const setSelectedMonthSafe = useCallback((month: string) => {
    if (isValidMonthFormat(month)) {
      setSelectedMonth(month)
    }
  }, [])

  useEffect(() => {
    if (currentBudget?.month && isValidMonthFormat(currentBudget.month)) {
      setSelectedMonth(currentBudget.month)
    } else if (budgets.length > 0 && !initialMonth) {
      const validBudgets = budgets.filter(b => b.month && isValidMonthFormat(b.month))
      if (validBudgets.length > 0) {
        const latestBudget = validBudgets.reduce((latest, budget) => 
          budget.month > latest.month ? budget : latest
        , validBudgets[0])
        setSelectedMonth(latestBudget.month)
      }
    }
  }, [currentBudget, budgets, initialMonth])

  return {
    selectedMonth,
    setSelectedMonth: setSelectedMonthSafe,
    availableMonths,
    currentMonth
  }
}

