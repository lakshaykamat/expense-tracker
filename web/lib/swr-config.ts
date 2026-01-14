/**
 * SWR Configuration
 * Production-grade configuration for data fetching and caching
 *
 * Best practices:
 * - Stale-while-revalidate pattern for optimal UX
 * - Smart retry logic for network errors
 * - Deduplication to prevent duplicate requests
 * - Error handling with logging
 */

import { SWRConfiguration } from "swr";

// Check if we're in development mode
const isDev = process.env.NODE_ENV === "development";

/**
 * Production-grade SWR configuration
 *
 * Features:
 * - Revalidates on focus/reconnect for fresh data
 * - Uses stale data while revalidating (better UX)
 * - Smart error retry with exponential backoff
 * - Deduplicates requests to prevent redundant calls
 * - Error logging in development
 */
export const swrConfig: SWRConfiguration = {
  // Revalidation strategy
  // SWR uses stale-while-revalidate by default (shows cached data while fetching fresh data)
  revalidateOnFocus: true, // Refresh data when window regains focus
  revalidateOnReconnect: true, // Refresh data when network reconnects

  // Throttle focus revalidation to prevent excessive requests
  // 5 seconds means max 1 revalidation per 5 seconds when tab gains focus
  focusThrottleInterval: 5000,

  // Request deduplication
  // Deduplicates identical requests within 2 seconds to prevent redundant calls
  dedupingInterval: 2000,

  // Error retry configuration
  // SWR uses exponential backoff internally: retryInterval * 2^attemptIndex
  errorRetryCount: 3, // Retry failed requests up to 3 times
  errorRetryInterval: 2000, // Base interval: 2s, 4s, 8s (exponential backoff)

  // Smart error retry logic
  shouldRetryOnError: (error: any) => {
    // Don't retry on 4xx client errors (except 408 Request Timeout and 429 Too Many Requests)
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      // Retry 408 (Request Timeout) and 429 (Too Many Requests with backoff)
      return error?.response?.status === 408 || error?.response?.status === 429;
    }

    // Retry on network errors (no response) or 5xx server errors
    return true;
  },

  // Error handling callback
  onError: (error: any, key: string) => {
    // Log errors in development for debugging
    if (isDev) {
      console.error(`[SWR Error] ${key}:`, error);
    }

    // In production, integrate with error tracking service
    // Example: Sentry.captureException(error, { tags: { swrKey: key } });
  },
};

/**
 * SWR Cache Keys
 * Centralized cache key management for consistent invalidation
 */
export const swrKeys = {
  expenses: {
    all: (month?: string) => (month ? `/expenses?month=${month}` : "/expenses"),
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
