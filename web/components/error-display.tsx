'use client'

import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface ErrorDisplayProps {
  error: string
  title?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
  variant?: 'default' | 'inline' | 'compact'
  showIcon?: boolean
}

export function ErrorDisplay({
  error,
  title,
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorDisplayProps) {
  const handleRetry = onRetry || (() => window.location.reload())
  const displayTitle = title || 'Something went wrong'

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{displayTitle}</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
      <Button
        variant="outline"
        onClick={handleRetry}
      >
        {retryLabel}
      </Button>
    </div>
  )
}

