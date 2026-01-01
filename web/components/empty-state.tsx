'use client'

import { Card, CardContent } from './ui/card'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center min-h-[40vh] gap-4 py-12">
        {icon && (
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-2">
            {icon}
          </div>
        )}
        <div className="text-center">
          <h3 className="text-xl font-light text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

