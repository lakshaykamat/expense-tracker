'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ErrorDisplay } from '@/components/error-display'
import { ProfileSkeleton } from '@/components/profile-skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'
import { AuthService } from '@/lib/auth-service'
import { usersApi } from '@/lib/users-api'
import { LogOut, Mail, Download } from 'lucide-react'

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, error } = useUser()
  const [exporting, setExporting] = useState(false)

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
      router.push('/login')
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const blob = await usersApi.exportToCSV()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expense-tracker-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error('Export error:', err)
      alert(err.message || 'Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <ProfileSkeleton />
      </PageLayout>
    )
  }

  if (error || !user) {
    return (
      <PageLayout>
        <Card>
          <CardContent className="p-6">
            <ErrorDisplay
              error={error || 'Failed to load user data'}
              title="Unable to load profile"
              variant="compact"
            />
            <div className="mt-4 flex justify-center">
              <Button onClick={handleLogout} variant="outline">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground mb-1">Email</div>
                <div className="text-base text-foreground break-words">{user.email}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="w-full"
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </>
                )}
              </Button>

              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}

