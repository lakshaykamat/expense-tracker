'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center gap-4 max-w-md text-center">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
        <Button onClick={() => reset()}>
          Try Again
        </Button>
      </div>
    </div>
  )
}

