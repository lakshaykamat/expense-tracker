"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useUser } from "@/features/auth";
import { usersApi } from "@/lib/api";
import { CookieUtils } from "@/lib/auth/cookie-utils";
import { EXPENSE_CATEGORIES } from "@/constants";
import { PageLayout } from "@/shared/components/page-layout";
import { Spinner } from "@/shared/components/ui/spinner";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
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
import { Eye, EyeOff, Copy, Check, RefreshCw, Trash2, KeyRound } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const DISPLAY_URL = BASE_URL || "https://your-domain.com";

/* -------------------------------------------------------------------------- */
/*  Reference data                                                            */
/* -------------------------------------------------------------------------- */

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface Param {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}

interface Endpoint {
  id: string;
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
  pathParams?: Param[];
  queryParams?: Param[];
  bodyParams?: Param[];
  curl: string;
  js: string;
  responseStatus: string;
  response: string;
}

const EXPENSE_OBJECT = `{
  "_id": "665f1e2a9c4d1a0012ab34cd",
  "title": "Coffee",
  "amount": 4.5,
  "description": "Morning latte",
  "category": "Food",
  "date": "2026-07-20T00:00:00.000Z",
  "userId": "665f1e2a9c4d1a0012ab0000",
  "createdAt": "2026-07-20T08:15:30.123Z",
  "updatedAt": "2026-07-20T08:15:30.123Z",
  "__v": 0
}`;

const indent = (json: string, spaces: number) =>
  json
    .split("\n")
    .map((line, i) => (i === 0 ? line : " ".repeat(spaces) + line))
    .join("\n");

const ENDPOINTS: Endpoint[] = [
  {
    id: "list-categories",
    method: "GET",
    path: "/api/v1/expenses/categories",
    title: "List categories",
    description: "Returns the standard categories accepted by expense create and update endpoints.",
    curl: `curl "${DISPLAY_URL}/api/v1/expenses/categories" \\
  -H "x-api-key: YOUR_API_KEY"`,
    js: `const res = await fetch("${DISPLAY_URL}/api/v1/expenses/categories", {
  headers: { "x-api-key": "YOUR_API_KEY" },
});
const { data: { categories } } = await res.json();`,
    responseStatus: "200 OK",
    response: `{
  "success": true,
  "statusCode": 200,
  "message": "Resource retrieved successfully",
  "data": {
    "categories": [
      "Food",
      "Fast Food",
      "Health & Fitness"
    ]
  }
}`,
  },
  {
    id: "list-expenses",
    method: "GET",
    path: "/api/v1/expenses",
    title: "List expenses",
    description:
      "Returns an array of expenses for the authenticated user, sorted by date (newest first). With no query parameters, the current month is returned.",
    queryParams: [
      { name: "month", type: "string", description: "Filter by month in YYYY-MM format (e.g. 2026-07)." },
      { name: "startDate", type: "string", description: "Start of a custom range, YYYY-MM-DD. Use together with endDate." },
      { name: "endDate", type: "string", description: "End of a custom range, YYYY-MM-DD. Use together with startDate." },
      { name: "groupBy", type: "string", description: 'Set to "category" (with startDate + endDate) to return a category breakdown.' },
      { name: "limit", type: "integer", description: "Maximum number of records to return. Between 1 and 100." },
    ],
    curl: `curl -X GET "${DISPLAY_URL}/api/v1/expenses?month=2026-07&limit=20" \\
  -H "x-api-key: YOUR_API_KEY"`,
    js: `const res = await fetch(
  "${DISPLAY_URL}/api/v1/expenses?month=2026-07&limit=20",
  { headers: { "x-api-key": "YOUR_API_KEY" } }
);
const expenses = await res.json();`,
    responseStatus: "200 OK",
    response: `[
  ${indent(EXPENSE_OBJECT, 2)}
]`,
  },
  {
    id: "get-expense",
    method: "GET",
    path: "/api/v1/expenses/:id",
    title: "Retrieve an expense",
    description: "Returns a single expense by its ID. Responds with 404 if the expense does not exist or does not belong to you.",
    pathParams: [{ name: "id", type: "string", required: true, description: "The expense ID (MongoDB ObjectId)." }],
    curl: `curl "${DISPLAY_URL}/api/v1/expenses/665f1e2a9c4d1a0012ab34cd" \\
  -H "x-api-key: YOUR_API_KEY"`,
    js: `const res = await fetch(
  "${DISPLAY_URL}/api/v1/expenses/665f1e2a9c4d1a0012ab34cd",
  { headers: { "x-api-key": "YOUR_API_KEY" } }
);
const expense = await res.json();`,
    responseStatus: "200 OK",
    response: EXPENSE_OBJECT,
  },
  {
    id: "create-expense",
    method: "POST",
    path: "/api/v1/expenses",
    title: "Create an expense",
    description: "Creates a new expense for the authenticated user and returns the created record.",
    bodyParams: [
      { name: "title", type: "string", required: true, description: "Expense title. 3–100 characters." },
      { name: "amount", type: "number", required: true, description: "Expense amount. Must be at least 0.01." },
      { name: "category", type: "string", description: "Category label. Must be one of the standard categories listed below." },
      { name: "description", type: "string", description: "Free-text note. Up to 500 characters." },
      { name: "date", type: "string", description: "ISO 8601 date (YYYY-MM-DD). Defaults to now if omitted." },
    ],
    curl: `curl -X POST "${DISPLAY_URL}/api/v1/expenses" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Coffee",
    "amount": 4.5,
    "category": "Food",
    "description": "Morning latte",
    "date": "2026-07-20"
  }'`,
    js: `const res = await fetch("${DISPLAY_URL}/api/v1/expenses", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Coffee",
    amount: 4.5,
    category: "Food",
  }),
});
const expense = await res.json();`,
    responseStatus: "201 Created",
    response: EXPENSE_OBJECT,
  },
  {
    id: "bulk-upsert-expenses",
    method: "POST",
    path: "/api/v1/expenses/bulk-upsert",
    title: "Bulk create or update expenses",
    description: "Creates items without an _id and updates items with an _id. Every supplied ID must belong to your API key's user; otherwise the request fails without creating new expenses.",
    bodyParams: [
      { name: "expenses", type: "array", required: true, description: "1–100 expense objects. Include _id only when updating an existing expense." },
      { name: "expenses[]._id", type: "string", description: "Existing expense ID. Omit to create a new expense." },
      { name: "expenses[].title", type: "string", required: true, description: "Expense title. 3–100 characters." },
      { name: "expenses[].amount", type: "number", required: true, description: "Expense amount. Must be at least 0.01." },
      { name: "expenses[].category", type: "string", description: "Standard category label." },
      { name: "expenses[].description", type: "string", description: "Free-text note. Up to 500 characters." },
      { name: "expenses[].date", type: "string", description: "ISO 8601 date (YYYY-MM-DD). Defaults to now when creating." },
    ],
    curl: `curl -X POST "${DISPLAY_URL}/api/v1/expenses/bulk-upsert" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "expenses": [
      { "_id": "665f1e2a9c4d1a0012ab34cd", "title": "Coffee", "amount": 5.0, "category": "Food", "date": "2026-07-20" },
      { "title": "Bus fare", "amount": 2.5, "category": "Transport", "date": "2026-07-21" }
    ]
  }'`,
    js: `const res = await fetch("${DISPLAY_URL}/api/v1/expenses/bulk-upsert", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    expenses: [
      { _id: "665f1e2a9c4d1a0012ab34cd", title: "Coffee", amount: 5.0, category: "Food", date: "2026-07-20" },
      { title: "Bus fare", amount: 2.5, category: "Transport", date: "2026-07-21" },
    ],
  }),
});
const result = await res.json();`,
    responseStatus: "201 Created",
    response: `{
  "created": 1,
  "updated": 1,
  "expenses": [
    ${indent(EXPENSE_OBJECT, 4)},
    ${indent(EXPENSE_OBJECT, 4)}
  ]
}`,
  },
  {
    id: "update-expense",
    method: "PATCH",
    path: "/api/v1/expenses/:id",
    title: "Update an expense",
    description: "Updates one or more fields of an existing expense. Only include the fields you want to change.",
    pathParams: [{ name: "id", type: "string", required: true, description: "The expense ID (MongoDB ObjectId)." }],
    bodyParams: [
      { name: "title", type: "string", description: "New title. 3–100 characters." },
      { name: "amount", type: "number", description: "New amount. Must be at least 0.01." },
      { name: "category", type: "string", description: "New category. Must be one of the standard categories listed below." },
      { name: "description", type: "string", description: "New note. Up to 500 characters." },
      { name: "date", type: "string", description: "New ISO 8601 date (YYYY-MM-DD)." },
    ],
    curl: `curl -X PATCH "${DISPLAY_URL}/api/v1/expenses/665f1e2a9c4d1a0012ab34cd" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "amount": 5.0 }'`,
    js: `const res = await fetch(
  "${DISPLAY_URL}/api/v1/expenses/665f1e2a9c4d1a0012ab34cd",
  {
    method: "PATCH",
    headers: {
      "x-api-key": "YOUR_API_KEY",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: 5.0 }),
  }
);
const expense = await res.json();`,
    responseStatus: "200 OK",
    response: EXPENSE_OBJECT,
  },
  {
    id: "delete-expense",
    method: "DELETE",
    path: "/api/v1/expenses/:id",
    title: "Delete an expense",
    description: "Permanently deletes an expense by its ID.",
    pathParams: [{ name: "id", type: "string", required: true, description: "The expense ID (MongoDB ObjectId)." }],
    curl: `curl -X DELETE "${DISPLAY_URL}/api/v1/expenses/665f1e2a9c4d1a0012ab34cd" \\
  -H "x-api-key: YOUR_API_KEY"`,
    js: `const res = await fetch(
  "${DISPLAY_URL}/api/v1/expenses/665f1e2a9c4d1a0012ab34cd",
  { method: "DELETE", headers: { "x-api-key": "YOUR_API_KEY" } }
);
const result = await res.json();`,
    responseStatus: "200 OK",
    response: `{
  "message": "Expense deleted successfully"
}`,
  },
];

const ERRORS = [
  { status: "400", title: "Bad Request", description: "A parameter failed validation (e.g. amount below 0.01 or a malformed date)." },
  { status: "401", title: "Unauthorized", description: "The x-api-key header is missing or the key is invalid." },
  { status: "404", title: "Not Found", description: "The requested expense does not exist or does not belong to you." },
];

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20",
  POST: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
  PATCH: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20",
  DELETE: "bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-500/20",
};

/* -------------------------------------------------------------------------- */
/*  Primitives                                                                */
/* -------------------------------------------------------------------------- */

function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      aria-label="Copy to clipboard"
      className={`inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${className}`}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span className={`inline-flex h-6 shrink-0 items-center rounded-md px-2 font-mono text-xs font-semibold ${METHOD_STYLES[method]}`}>
      {method}
    </span>
  );
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <div className="group relative">
      {language ? (
        <span className="absolute left-3 top-2.5 select-none font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
          {language}
        </span>
      ) : null}
      <CopyButton text={code} className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100" />
      <pre className={`overflow-x-auto rounded-lg border bg-muted/60 p-4 font-mono text-xs leading-relaxed ${language ? "pt-8" : ""}`}>
        {code}
      </pre>
    </div>
  );
}

function ParamTable({ title, params }: { title: string; params: Param[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <tbody className="divide-y">
            {params.map((p) => (
              <tr key={p.name} className="align-top">
                <td className="w-40 whitespace-nowrap px-3 py-2.5">
                  <span className="font-mono text-xs font-medium">{p.name}</span>
                  {p.required ? (
                    <span className="ml-1.5 text-[10px] font-medium text-red-500">required</span>
                  ) : null}
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{p.type}</div>
                </td>
                <td className="px-3 py-2.5 text-sm text-muted-foreground">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Endpoint reference block                                                  */
/* -------------------------------------------------------------------------- */

function EndpointDoc({ endpoint }: { endpoint: Endpoint }) {
  const [lang, setLang] = useState("curl");
  return (
    <Card id={endpoint.id} className="scroll-mt-20 overflow-hidden">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <h3 className="text-base font-semibold">{endpoint.title}</h3>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
            <MethodBadge method={endpoint.method} />
            <code className="min-w-0 flex-1 truncate font-mono text-sm">{endpoint.path}</code>
            <CopyButton text={`${DISPLAY_URL}${endpoint.path}`} />
          </div>
          <p className="text-sm text-muted-foreground">{endpoint.description}</p>
        </div>

        {endpoint.pathParams ? <ParamTable title="Path parameters" params={endpoint.pathParams} /> : null}
        {endpoint.queryParams ? <ParamTable title="Query parameters" params={endpoint.queryParams} /> : null}
        {endpoint.bodyParams ? <ParamTable title="Body parameters" params={endpoint.bodyParams} /> : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Request</p>
            <Tabs value={lang} onValueChange={setLang}>
              <TabsList className="h-8">
                <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
                <TabsTrigger value="js" className="text-xs">JavaScript</TabsTrigger>
              </TabsList>
              <TabsContent value="curl" className="mt-2">
                <CodeBlock code={endpoint.curl} />
              </TabsContent>
              <TabsContent value="js" className="mt-2">
                <CodeBlock code={endpoint.js} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Response</p>
              <Badge variant="secondary" className="font-mono text-[10px]">{endpoint.responseStatus}</Badge>
            </div>
            <CodeBlock code={endpoint.response} language="json" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

const NAV = [
  { id: "authentication", label: "Authentication" },
  { id: "expense-object", label: "The Expense object" },
  { id: "categories", label: "Categories" },
  ...ENDPOINTS.map((e) => ({ id: e.id, label: e.title })),
  { id: "errors", label: "Errors" },
];

export default function DeveloperPage() {
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const { user, refetch } = useUser(hasAuthToken);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    setHasAuthToken(CookieUtils.hasAuthToken());
  }, []);

  const copyKey = async (text: string) => {
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

  return (
    <PageLayout>
      <div className="space-y-10">
        {/* Header */}
        <header className="space-y-2 border-b pb-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-[10px]">v1</Badge>
            <span className="text-xs text-muted-foreground">REST API</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Developer API</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Programmatically manage your expenses from external tools like n8n, Telegram bots, or your
            own scripts. Authenticate with your personal API key and call the endpoints below.
          </p>
        </header>

        {/* Quick nav */}
        <nav className="flex flex-wrap gap-2">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* API key management */}
        {hasAuthToken && user ? <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Your API key</p>
            </div>

            {user?.apiKey ? (
              <>
                <div className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2 font-mono text-sm">
                  <span className="flex-1 truncate">{visible ? user.apiKey : "•".repeat(40)}</span>
                  <button
                    onClick={() => setVisible((v) => !v)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={visible ? "Hide key" : "Show key"}
                  >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => copyKey(user.apiKey!)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Copy key"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={working}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Regenerate API key?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will invalidate your current key. Any existing integrations using it will
                          stop working immediately.
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
                        <Trash2 className="mr-2 h-4 w-4" />
                        Revoke
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
                        <AlertDialogDescription>
                          All integrations using this key will stop working. You can generate a new key
                          at any time.
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
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have an API key yet. Generate one to start making requests.
                </p>
                <Button onClick={handleGenerate} disabled={working} size="sm">
                  {working ? <Spinner size="sm" className="mr-2" /> : null}
                  Generate API key
                </Button>
              </div>
            )}
          </CardContent>
        </Card> : null}

        {/* Authentication */}
        <Section id="authentication" title="Authentication">
          <p className="text-sm text-muted-foreground">
            All requests are authenticated with your API key, passed in the{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">x-api-key</code> header.
            Requests without a valid key return <span className="font-mono text-xs">401 Unauthorized</span>.
          </p>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Base URL</p>
            <div className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2 font-mono text-sm">
              <span className="flex-1 truncate">{DISPLAY_URL}</span>
              <CopyButton text={DISPLAY_URL} />
            </div>
          </div>
          <CodeBlock language="http" code={`x-api-key: YOUR_API_KEY`} />
        </Section>

        {/* Expense object */}
        <Section id="expense-object" title="The Expense object">
          <p className="text-sm text-muted-foreground">
            Every expense endpoint returns objects in the following shape.
          </p>
          <div className="grid gap-5 lg:grid-cols-2">
            <ParamTable
              title="Attributes"
              params={[
                { name: "_id", type: "string", description: "Unique identifier for the expense." },
                { name: "title", type: "string", description: "Expense title." },
                { name: "amount", type: "number", description: "Expense amount." },
                { name: "category", type: "string", description: "Category label, if set. One of the standard categories listed below." },
                { name: "description", type: "string", description: "Free-text note, if set." },
                { name: "date", type: "string", description: "Expense date (ISO 8601)." },
                { name: "createdAt", type: "string", description: "When the record was created." },
                { name: "updatedAt", type: "string", description: "When the record was last updated." },
              ]}
            />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example</p>
              <CodeBlock code={EXPENSE_OBJECT} language="json" />
            </div>
          </div>
        </Section>

        {/* Categories */}
        <Section id="categories" title="Categories">
          <p className="text-sm text-muted-foreground">
            The <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">category</code> field
            must be one of the following standard categories. Use these exact labels so your expenses
            appear correctly in category breakdowns and reports.
          </p>
          <div className="flex flex-wrap gap-2">
            {EXPENSE_CATEGORIES.map((category) => (
              <Badge key={category} variant="secondary" className="font-mono text-xs">
                {category}
              </Badge>
            ))}
          </div>
        </Section>

        {/* Endpoints */}
        <Section id="endpoints" title="API reference">
          <div className="space-y-6">
            {ENDPOINTS.map((endpoint) => (
              <EndpointDoc key={endpoint.id} endpoint={endpoint} />
            ))}
          </div>
        </Section>

        {/* Errors */}
        <Section id="errors" title="Errors">
          <p className="text-sm text-muted-foreground">
            The API uses conventional HTTP status codes. Errors return a JSON body with a{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">message</code> describing what went wrong.
          </p>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                {ERRORS.map((e) => (
                  <tr key={e.status} className="align-top">
                    <td className="w-20 px-3 py-3 font-mono text-sm font-semibold text-red-500">{e.status}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{e.title}</div>
                      <div className="text-sm text-muted-foreground">{e.description}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </PageLayout>
  );
}
