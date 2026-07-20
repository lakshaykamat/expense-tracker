"use client";

import { useState } from "react";
import { useUser } from "@/features/auth";
import { usersApi } from "@/lib/api";
import { PageLayout } from "@/shared/components/page-layout";
import { Spinner } from "@/shared/components/ui/spinner";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Eye, EyeOff, Copy, Check, RefreshCw, Trash2 } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const ENDPOINTS = [
  { method: "GET", path: "/api/v1/expenses", description: "List expenses" },
  { method: "GET", path: "/api/v1/expenses/:id", description: "Get expense by ID" },
  { method: "POST", path: "/api/v1/expenses", description: "Create expense" },
  { method: "PATCH", path: "/api/v1/expenses/:id", description: "Update expense" },
  { method: "DELETE", path: "/api/v1/expenses/:id", description: "Delete expense" },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "text-blue-500",
  POST: "text-green-500",
  PATCH: "text-yellow-500",
  DELETE: "text-red-500",
};

export default function DeveloperPage() {
  const { user, loading, refetch } = useUser();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [working, setWorking] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    setWorking(true);
    try {
      await usersApi.generateApiKey();
      await refetch();
      setVisible(true);
    } finally {
      setWorking(false);
    }
  };

  const handleRevoke = async () => {
    setWorking(true);
    try {
      await usersApi.revokeApiKey();
      await refetch();
      setVisible(false);
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Developer API</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Use your API key to manage expenses from external tools like n8n or Telegram bots.
          </p>
        </div>

        {/* API Key card */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm font-medium">API Key</p>

            {user?.apiKey ? (
              <>
                <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2 font-mono text-sm">
                  <span className="flex-1 truncate">
                    {visible ? user.apiKey : "•".repeat(40)}
                  </span>
                  <button
                    onClick={() => setVisible((v) => !v)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={visible ? "Hide key" : "Show key"}
                  >
                    {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(user.apiKey!)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Copy key"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={working}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Regenerate API key?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will invalidate your current key. Any existing integrations using
                          it will stop working immediately.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleGenerate}>Regenerate</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" disabled={working}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Revoke
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
                        <AlertDialogDescription>
                          All integrations using this key will stop working. You can generate a
                          new key at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleRevoke}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Revoke
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">No API key yet.</p>
                <Button onClick={handleGenerate} disabled={working} size="sm">
                  {working ? <Spinner size="sm" className="mr-2" /> : null}
                  Generate API key
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Base URL card */}
        <Card>
          <CardContent className="p-6 space-y-2">
            <p className="text-sm font-medium">Base URL</p>
            <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2 font-mono text-sm">
              <span className="flex-1">{BASE_URL}</span>
              <button
                onClick={() => copyToClipboard(BASE_URL)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Copy base URL"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Every request must include the header <code className="font-mono">x-api-key: &lt;your-key&gt;</code>.
            </p>
          </CardContent>
        </Card>

        {/* Endpoints reference */}
        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="text-sm font-medium">Endpoints</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="pb-2 font-medium w-16">Method</th>
                  <th className="pb-2 font-medium">Path</th>
                  <th className="pb-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ENDPOINTS.map((e) => (
                  <tr key={e.path + e.method} className="py-2">
                    <td className={`py-2 font-mono font-semibold text-xs ${METHOD_COLORS[e.method]}`}>
                      {e.method}
                    </td>
                    <td className="py-2 font-mono text-xs">{e.path}</td>
                    <td className="py-2 text-muted-foreground">{e.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Quick-start */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm font-medium">Quick Start</p>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">List expenses (curl)</p>
              <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto">{`curl ${BASE_URL}/api/v1/expenses \\
  -H "x-api-key: YOUR_API_KEY"`}</pre>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Create an expense (curl)</p>
              <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto">{`curl -X POST ${BASE_URL}/api/v1/expenses \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Coffee","amount":4.5,"category":"Food"}'`}</pre>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">n8n HTTP Request node</p>
              <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto">{`Method: POST
URL: ${BASE_URL}/api/v1/expenses
Headers:
  x-api-key: {{ $env.EXPENSE_API_KEY }}
  Content-Type: application/json
Body (JSON):
  {
    "title": "{{ $json.title }}",
    "amount": {{ $json.amount }},
    "category": "{{ $json.category }}"
  }`}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
