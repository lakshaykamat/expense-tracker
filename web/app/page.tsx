'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = "force-dynamic";

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    try {
      router.push('/home')
    } catch (error) {
      // Fallback if router fails
      console.error('Navigation error:', error)
      window.location.href = '/home'
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  )
}
