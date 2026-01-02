'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
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
  variant = 'default',
  showIcon = true
}: ErrorDisplayProps) {
  const defaultTitle = title || 'Something went wrong'
  
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg', className)}>
        {showIcon && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-900">{defaultTitle}</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="shrink-0"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryLabel}
          </Button>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('text-center space-y-2', className)}>
        {showIcon && (
          <div className="inline-flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-900">{defaultTitle}</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2"
          >
            {retryLabel}
          </Button>
        )}
      </div>
    )
  }

  // Default variant - centered full error display
  return (
    <div className={cn('flex items-center justify-center min-h-[40vh]', className)}>
      <div className="text-center space-y-4 max-w-md">
        {showIcon && (
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{defaultTitle}</h3>
          <p className="text-gray-600">{error}</p>
        </div>
        {onRetry && (
          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onRetry}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryLabel}
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

