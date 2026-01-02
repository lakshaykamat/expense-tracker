'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export function MobileHeader() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || pathname === '/login' || pathname === '/signup') {
    return null
  }

  return (
    <header className="md:hidden border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg">Expense Tracker</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
