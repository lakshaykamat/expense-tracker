/**
 * @deprecated Use api.client.ts for client components or api.server.ts for server components
 * This file is kept for backward compatibility and re-exports from api.client.ts
 */
'use client'

// Re-export everything from api.client for backward compatibility
export * from './api.client'
export { api } from './api.client'
