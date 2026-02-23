'use client'

import { PageFab } from '@/shared/components/page-fab'
import { Plus } from 'lucide-react'

interface BudgetFabProps {
  onClick: () => void;
  children?: React.ReactNode;
}

export function BudgetFab({ onClick, children }: BudgetFabProps) {
  return (
    <PageFab onClick={onClick}>
      {children || <Plus className="w-6 h-6" />}
    </PageFab>
  )
}
