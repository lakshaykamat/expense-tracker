import { useState, useEffect, useCallback } from 'react'
import { getCurrentMonth, generateAvailableMonths } from '@/utils/date.utils'
import { isValidMonthFormat } from '@/utils/validation.utils'

interface UseMonthSelectionOptions {
  initialMonth?: string
}

export function useMonthSelection(options: UseMonthSelectionOptions = {}) {
  const { initialMonth } = options
  const currentMonth = getCurrentMonth()
  
  // Generate last 12 months
  const availableMonths = generateAvailableMonths(12)
  
  // Get initial month - initialize immediately, not in useEffect
  const getInitialMonth = () => {
    if (initialMonth && isValidMonthFormat(initialMonth)) {
      return initialMonth
    }
    return currentMonth
  }
  
  const [selectedMonth, setSelectedMonth] = useState<string>(getInitialMonth())

  const setSelectedMonthSafe = useCallback((month: string) => {
    if (isValidMonthFormat(month)) {
      setSelectedMonth(month)
    }
  }, [])

  return {
    selectedMonth: selectedMonth || currentMonth,
    setSelectedMonth: setSelectedMonthSafe,
    availableMonths,
    currentMonth
  }
}

