import { SWRConfiguration } from 'swr'

const isDev = process.env.NODE_ENV === 'development'

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  focusThrottleInterval: 5000,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 2000,
  shouldRetryOnError: (error: any) => {
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return error?.response?.status === 408 || error?.response?.status === 429
    }
    return true
  },
  onError: (error: any, key: string) => {
    if (isDev) console.error(`[SWR Error] ${key}:`, error)
  },
}

export const swrKeys = {
  expenses: {
    all: (month?: string) => (month ? `/expenses?month=${month}` : '/expenses'),
    byId: (id: string) => `/expenses/${id}`,
  },
  budgets: {
    byId: (id: string) => `/budgets/${id}`,
    byMonth: (month: string) => `/budgets/month/${month}`,
  },
  analysis: {
    stats: (month: string) => `/budgets/analysis/stats?month=${month}`,
  },
} as const
