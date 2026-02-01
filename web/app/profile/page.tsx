"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { PageLayout } from "@/components/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorDisplay } from "@/components/error-display";
import { ProfileSkeleton } from "@/components/profile-skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/hooks/useUser";
import { AuthService } from "@/lib/auth-service";
import { usersApi } from "@/lib/users-api";
import { LogOut, Download, Sun, Moon } from "lucide-react";

export const dynamic = "force-dynamic";

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, error } = useUser();
  const { theme, setTheme } = useTheme();
  const [exporting, setExporting] = useState(false);

  const handleLogout = async () => {
    await AuthService.logout().finally(() => router.push("/login"));
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await usersApi.exportToCSV();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `expense-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <ProfileSkeleton />
      </PageLayout>
    );
  }

  if (!user || error) {
    return (
      <PageLayout>
        <Card>
          <CardContent className="p-8 space-y-6 text-center">
            <ErrorDisplay
              error={error || "Failed to load profile"}
              title="Something went wrong"
              variant="compact"
            />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Go to login
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const isDark = theme === "dark";

  return (
    <PageLayout>
      <div className="max-w-sm mx-auto">
        <Card>
          <CardContent className="p-6 space-y-8">
            {/* Identity */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold">
                {getInitials(user.email)}
              </div>
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-medium truncate">{user.email}</p>
            </div>

            {/* Appearance */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Appearance
              </p>
              <div className="flex rounded-lg bg-muted p-1">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md transition ${
                    !isDark
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md transition ${
                    isDark
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
              </div>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Data
              </p>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <Spinner size="sm" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {exporting ? "Exporting…" : "Export CSV"}
              </Button>
            </div>

            {/* Danger zone */}
            <div className="pt-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
