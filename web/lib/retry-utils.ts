/**
 * Retry utility with exponential backoff for handling network errors and timeouts
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  retryableStatusCodes?: number[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 8000, // 8 seconds
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Checks if an error should be retried
 */
function isRetryableError(error: any): boolean {
  // Network errors (no response) - always retry
  if (!error.response) {
    return true;
  }

  // Check if status code is retryable
  const status = error.response?.status;
  if (status && DEFAULT_OPTIONS.retryableStatusCodes.includes(status)) {
    return true;
  }

  // Timeout errors - always retry
  if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
    return true;
  }

  return false;
}

/**
 * Calculates delay for exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number
): number {
  const delay = initialDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries a function with exponential backoff
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Calculate delay and wait before retrying
      const delay = calculateDelay(
        attempt,
        config.initialDelay,
        config.maxDelay
      );
      await sleep(delay);
    }
  }

  // All retries exhausted, throw the last error
  throw lastError;
}
