import { useState, useCallback } from 'react'
import { getCurrentMonth, generateAvailableMonths } from '@/utils/date.utils'
import { isValidMonthFormat } from '@/utils/validation.utils'

interface UseMonthSelectionOptions {
  initialMonth?: string
}

export function useMonthSelection(options: UseMonthSelectionOptions = {}) {
  const { initialMonth } = options
  
  // getCurrentMonth already has fallback in utils
  const currentMonth = getCurrentMonth()
  const availableMonths = generateAvailableMonths(12)
  
  // Get initial month
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

