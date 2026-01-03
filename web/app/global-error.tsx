'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            maxWidth: '28rem',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                Something went wrong
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                {error.message}
              </p>
            </div>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

