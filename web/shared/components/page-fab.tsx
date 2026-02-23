'use client'

import { Button } from '@/shared/components/ui/button'

interface PageFabProps {
  onClick: () => void
  children: React.ReactNode
}

export function PageFab({ onClick, children }: PageFabProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-20 right-4 z-[60] w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 bg-primary text-primary-foreground md:hidden"
    >
      {children}
    </Button>
  )
}
