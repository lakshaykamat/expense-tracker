"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthService } from "@/lib/auth-service"

export default function HomePage() {
  const [userDetails, setUserDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    if (!AuthService.isAuthenticated()) {
      router.push('/login')
      return
    }

    // Fetch user details
    const fetchUserDetails = async () => {
      setIsLoading(true)
      try {
        const response = await AuthService.getCurrentUser()
        if (response.success) {
          setUserDetails(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserDetails()
  }, [router])

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      router.push('/login')
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const displayUser = userDetails

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="border-b bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Expense Tracker</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {displayUser?.email || 'User'}!
            </h2>
            <p className="text-muted-foreground">
              Here's your account information and recent activity.
            </p>
          </div>

          {/* User Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Your personal information and account status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p className="font-mono text-sm bg-muted p-2 rounded">
                    {displayUser?.id || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                  <p className="text-sm bg-muted p-2 rounded">
                    {displayUser?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                  <p className="text-sm bg-muted p-2 rounded">
                    {displayUser?.createdAt 
                      ? new Date(displayUser.createdAt).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                  <p className="text-sm bg-muted p-2 rounded">
                    {displayUser?.lastLoginAt 
                      ? new Date(displayUser.lastLoginAt).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Add Expense</CardTitle>
                <CardDescription>
                  Quickly add a new expense to track
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/expenses/new">
                  <Button className="w-full">Add Expense</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">View Expenses</CardTitle>
                <CardDescription>
                  Browse and manage your expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/expenses">
                  <Button className="w-full" variant="outline">View All</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Analytics</CardTitle>
                <CardDescription>
                  View spending insights and reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/analytics">
                  <Button className="w-full" variant="outline">View Analytics</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Authenticated</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (Tokens stored securely)
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Access Token: {AuthService.getAccessToken() ? '✓ Valid' : '✗ Missing'}
                <br />
                Refresh Token: {AuthService.getRefreshToken() ? '✓ Valid' : '✗ Missing'}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
