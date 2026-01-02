import { useState, useEffect, useCallback } from 'react'
import { budgetsApi } from '@/lib/budgets-api'
import { AnalysisStats } from '@/types'
import { isValidMonthFormat } from '@/utils/validation.utils'

export function useAnalysisStats(month: string) {
  const [analysisStats, setAnalysisStats] = useState<AnalysisStats | null>(null)
  const [loading, setLoading] = useState(() => {
    // Start with loading true if month is valid on mount
    return !!(month && isValidMonthFormat(month))
  })
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async (monthToFetch: string) => {
    if (!monthToFetch || !isValidMonthFormat(monthToFetch)) {
      setError('Invalid month format')
      setAnalysisStats(null)
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const stats = await budgetsApi.getAnalysisStats(monthToFetch)
      if (stats && typeof stats === 'object') {
        setAnalysisStats(stats)
      } else {
        setAnalysisStats(null)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch analysis data'
      setError(errorMessage)
      setAnalysisStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (month && isValidMonthFormat(month)) {
      fetchStats(month)
    } else {
      setAnalysisStats(null)
      setLoading(false)
    }
  }, [month, fetchStats])

  return { analysisStats, loading, error, refetch: () => fetchStats(month) }
}

