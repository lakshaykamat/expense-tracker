'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = "force-dynamic";

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/home')
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  )
}
