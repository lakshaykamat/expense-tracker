/**
 * CORS configuration utilities
 */

/**
 * Get CORS origins configuration
 * Supports:
 * - Comma-separated URLs from FRONTEND_URL environment variable
 * - All .vercel.app domains
 * - Dynamic origin checking via callback function
 */
export function getCorsOrigins(): string[] | string | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  // If comma-separated, split and trim each URL
  const origins: string[] = frontendUrl.includes(',')
    ? frontendUrl
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0)
    : [frontendUrl];
  
  // Return callback function for dynamic origin checking
  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in the allowed list
    if (origins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check if origin matches .vercel.app pattern
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    // Default: deny
    callback(null, false);
  };
}

