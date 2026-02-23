interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  retryableStatusCodes?: number[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 8000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

function isRetryableError(error: any): boolean {
  if (!error.response) return true;
  const status = error.response?.status;
  if (status && DEFAULT_OPTIONS.retryableStatusCodes.includes(status)) return true;
  if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") return true;
  return false;
}

function calculateDelay(attempt: number, initialDelay: number, maxDelay: number): number {
  const delay = initialDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
      if (!isRetryableError(error)) throw error;
      if (attempt === config.maxRetries) break;
      const delay = calculateDelay(attempt, config.initialDelay, config.maxDelay);
      await sleep(delay);
    }
  }
  throw lastError;
}
