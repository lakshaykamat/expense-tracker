/**
 * SWR Configuration
 * Centralized configuration for data fetching and caching
 */

import { SWRConfiguration } from 'swr';

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  shouldRetryOnError: (error: any) => {
    // Don't retry on 4xx errors (client errors)
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return false;
    }
    return true;
  },
};

/**
 * SWR Cache Keys
 * Centralized cache key management for consistent invalidation
 */
export const swrKeys = {
  expenses: {
    all: (month?: string) => month ? `/expenses?month=${month}` : '/expenses',
    byId: (id: string) => `/expenses/${id}`,
  },
  budgets: {
    byId: (id: string) => `/budgets/${id}`,
    byMonth: (month: string) => `/budgets/month/${month}`,
  },
  analysis: {
    stats: (month: string) => `/budgets/analysis/stats?month=${month}`,
  },
} as const;

