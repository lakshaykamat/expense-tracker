import { useState, useEffect, useCallback } from 'react'
import { AuthService } from '@/lib/auth-service'
import { User } from '@/types'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await AuthService.getCurrentUser()
      if (response?.data) {
        setUser(response.data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return {
    user,
    loading,
    error,
    refetch: fetchUser
  }
}

