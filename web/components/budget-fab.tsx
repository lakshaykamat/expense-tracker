'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { FabButtonProps } from '@/types'

export function BudgetFab({ onClick, children }: FabButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 bg-primary text-primary-foreground md:hidden"
    >
      {children || <Plus className="w-6 h-6" />}
    </Button>
  )
}
