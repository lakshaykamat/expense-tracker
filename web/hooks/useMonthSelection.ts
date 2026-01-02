import { useState, useEffect, useCallback } from 'react'
import { getCurrentMonth, generateAvailableMonths } from '@/utils/date.utils'
import { isValidMonthFormat } from '@/utils/validation.utils'

interface UseMonthSelectionOptions {
  initialMonth?: string
}

export function useMonthSelection(options: UseMonthSelectionOptions = {}) {
  const { initialMonth } = options
  const currentMonth = getCurrentMonth()
  const [initialized, setInitialized] = useState(false)
  
  // Generate last 12 months
  const availableMonths = generateAvailableMonths(12)
  
  // Get initial month
  const getInitialMonth = useCallback(() => {
    if (initialMonth && isValidMonthFormat(initialMonth)) {
      return initialMonth
    }
    return currentMonth
  }, [initialMonth, currentMonth])
  
  const [selectedMonth, setSelectedMonth] = useState<string>('')

  const setSelectedMonthSafe = useCallback((month: string) => {
    if (isValidMonthFormat(month)) {
      setSelectedMonth(month)
    }
  }, [])

  // Initialize with current month on first load only
  useEffect(() => {
    if (!initialized) {
      const initial = getInitialMonth()
      if (initial) {
        setSelectedMonth(initial)
        setInitialized(true)
      }
    }
  }, [getInitialMonth, initialized])

  return {
    selectedMonth: selectedMonth || currentMonth,
    setSelectedMonth: setSelectedMonthSafe,
    availableMonths,
    currentMonth
  }
}

