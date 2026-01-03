/**
 * API-related business logic helpers
 */

/**
 * Extracts error message from API error (API-specific business logic)
 */
export function extractErrorMessage(error: any, defaultMessage: string): string {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (error?.message) {
    return error.message
  }
  return defaultMessage
}

/**
 * Creates initial loading state based on month validation (API state management logic)
 */
export function createInitialLoadingState(month: string | undefined, isValidMonth: (m: string) => boolean): boolean {
  return !!(month && isValidMonth(month))
}

/**
 * Result type for async operations
 */
export interface AsyncResult<T = void> {
  success: boolean
  error?: string
  data?: T
}

/**
 * Retries an async operation up to maxRetries times with delay between retries
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }
  
  throw lastError
}

