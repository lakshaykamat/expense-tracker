'use client'

import { Button } from './ui/button'
import { FabButtonProps } from '@/types'
import { Plus } from 'lucide-react'

export function FabButton({ onClick, children }: FabButtonProps) {
  return (
    <div className="fixed bottom-20 right-6 z-[60] sm:hidden">
      <Button
        onClick={onClick}
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg"
      >
        {children || <Plus className="w-6 h-6" />}
      </Button>
    </div>
  )
}
