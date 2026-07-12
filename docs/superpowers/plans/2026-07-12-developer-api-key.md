# Developer API Key Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each user a personal API key so they can programmatically manage expenses from external tools (n8n, Telegram bot) via a dedicated `/api/v1/expenses` prefix.

**Architecture:** Add `apiKey` field to the existing `User` schema; a new `ApiKeyGuard` reads the `x-api-key` header and resolves the user via DB lookup; a new `ExpensesPublicController` at `/api/v1/expenses` reuses the existing service layer untouched. The web adds a `/developer` page where users generate, copy, and revoke their key.

**Tech Stack:** NestJS 11, Mongoose, Node `crypto`, Next.js 16 App Router, React 19, shadcn/ui, Tailwind 4, SWR, Axios.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `server/src/auth/schemas/user.schema.ts` | Add `apiKey` field |
| Modify | `server/src/auth/auth.service.ts` | Add `findByApiKey`, `generateApiKey`, `revokeApiKey`, expose `apiKey` in `getLoggedInUser` |
| Create | `server/src/auth/guards/api-key.guard.ts` | Guard: reads `x-api-key` header, resolves user |
| Modify | `server/src/auth/auth.module.ts` | Register + export `ApiKeyGuard` |
| Modify | `server/src/users/users.controller.ts` | Add `POST /users/api-key` and `DELETE /users/api-key` |
| Create | `server/src/modules/expenses/controller/expenses-public.controller.ts` | `/api/v1/expenses` CRUD reusing existing services |
| Modify | `server/src/modules/expenses/expenses.module.ts` | Register `ExpensesPublicController` |
| Modify | `web/types/auth.ts` | Add `apiKey?: string` to `User` interface |
| Modify | `web/lib/api/users-api.ts` | Add `generateApiKey()` and `revokeApiKey()` |
| Create | `web/app/developer/page.tsx` | `/developer` page: key display, copy, generate, revoke, docs |
| Modify | `web/app/profile/page.tsx` | Add Developer navigation link |

---

## Task 1: Add `apiKey` field to User schema

**Files:**
- Modify: `server/src/auth/schemas/user.schema.ts`

- [ ] **Step 1: Add the field**

Open `server/src/auth/schemas/user.schema.ts`. Add one `@Prop()` line after `lastLoginAt`:

```typescript
@Prop({ default: false })
isEmailVerified: boolean;

@Prop({ default: new Date() })
lastLoginAt?: Date;

@Prop()
apiKey?: string;   // ← add this
```

- [ ] **Step 2: Verify the server still compiles**

```bash
cd server && pnpm build
```

Expected: `Successfully compiled` (or equivalent nest build output, no errors).

- [ ] **Step 3: Commit**

```bash
git add server/src/auth/schemas/user.schema.ts
git commit -m "feat: add apiKey field to User schema"
```

---

## Task 2: Add API key methods to AuthService

**Files:**
- Modify: `server/src/auth/auth.service.ts`

- [ ] **Step 1: Add `crypto` import at the top**

At the top of `server/src/auth/auth.service.ts`, add:

```typescript
import { randomBytes } from 'crypto';
```

- [ ] **Step 2: Add three methods to the `AuthService` class**

Add these three methods at the bottom of the class body (before the closing `}`):

```typescript
async findByApiKey(key: string): Promise<UserDocument | null> {
  return this.userModel.findOne({ apiKey: key });
}

async generateApiKey(userId: string): Promise<string> {
  const key = `et_${randomBytes(32).toString('hex')}`;
  await this.userModel.findByIdAndUpdate(userId, { apiKey: key });
  return key;
}

async revokeApiKey(userId: string): Promise<void> {
  await this.userModel.findByIdAndUpdate(userId, { $unset: { apiKey: '' } });
}
```

- [ ] **Step 3: Expose `apiKey` in `getLoggedInUser`**

Find the existing `getLoggedInUser` method and update its return value:

```typescript
async getLoggedInUser(user: UserDocument) {
  return {
    id: user._id.toString(),
    email: user.email,
    createdAt: (user as any).createdAt,
    lastLoginAt: user.lastLoginAt,
    apiKey: user.apiKey ?? null,
  };
}
```

- [ ] **Step 4: Build to confirm no errors**

```bash
cd server && pnpm build
```

Expected: clean build.

- [ ] **Step 5: Commit**

```bash
git add server/src/auth/auth.service.ts
git commit -m "feat: add findByApiKey, generateApiKey, revokeApiKey to AuthService"
```

---

## Task 3: Create ApiKeyGuard

**Files:**
- Create: `server/src/auth/guards/api-key.guard.ts`

- [ ] **Step 1: Create the guard file**

Create `server/src/auth/guards/api-key.guard.ts` with this content:

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service.js';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['x-api-key'];

    if (!key || typeof key !== 'string') {
      throw new UnauthorizedException('API key required');
    }

    const user = await this.authService.findByApiKey(key);
    if (!user) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.user = {
      ...user.toObject(),
      userId: user._id.toString(),
    };

    return true;
  }
}
```

- [ ] **Step 2: Build to confirm no errors**

```bash
cd server && pnpm build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add server/src/auth/guards/api-key.guard.ts
git commit -m "feat: add ApiKeyGuard"
```

---

## Task 4: Register ApiKeyGuard in AuthModule

**Files:**
- Modify: `server/src/auth/auth.module.ts`

- [ ] **Step 1: Import and register the guard**

Replace the full content of `server/src/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtService } from './jwt.service.js';
import { User, UserSchema } from './schemas/user.schema.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { ApiKeyGuard } from './guards/api-key.guard.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtAuthGuard, ApiKeyGuard],
  exports: [AuthService, JwtAuthGuard, ApiKeyGuard],
})
export class AuthModule {}
```

- [ ] **Step 2: Build to confirm no errors**

```bash
cd server && pnpm build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add server/src/auth/auth.module.ts
git commit -m "feat: register and export ApiKeyGuard from AuthModule"
```

---

## Task 5: Add API key endpoints to UsersController

**Files:**
- Modify: `server/src/users/users.controller.ts`

- [ ] **Step 1: Replace the full UsersController**

Replace the full content of `server/src/users/users.controller.ts`:

```typescript
import { Controller, Get, Post, Delete, UseGuards, Req, Res } from "@nestjs/common";
import type { Response } from 'express';
import { UsersService } from "./users.service.js";
import { AuthService } from "../auth/auth.service.js";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { LoggedInUser } from "../common/decorators/loggedin-user.decorator.js";
import type { UserDocument } from "../auth/schemas/user.schema.js";

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('export/csv')
  @UseGuards(JwtAuthGuard)
  async exportToCSV(@Req() req, @Res() res: Response) {
    const { csv, filename } = await this.usersService.exportDataToCSV(req.user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Post('api-key')
  @UseGuards(JwtAuthGuard)
  async generateApiKey(@LoggedInUser() user: UserDocument) {
    const apiKey = await this.authService.generateApiKey(user._id.toString());
    return { apiKey };
  }

  @Delete('api-key')
  @UseGuards(JwtAuthGuard)
  async revokeApiKey(@LoggedInUser() user: UserDocument) {
    await this.authService.revokeApiKey(user._id.toString());
    return { message: 'API key revoked' };
  }
}
```

- [ ] **Step 2: Build to confirm no errors**

```bash
cd server && pnpm build
```

Expected: clean build.

- [ ] **Step 3: Smoke test the endpoints manually**

Start the server: `cd server && pnpm start:dev`

Register or log in to get a JWT, then:

```bash
# Generate a key
curl -X POST http://localhost:8000/users/api-key \
  -H "Authorization: Bearer <your-jwt>" \
  -H "Content-Type: application/json"
# Expected: { "data": { "apiKey": "et_..." }, "statusCode": 201 }

# Revoke the key
curl -X DELETE http://localhost:8000/users/api-key \
  -H "Authorization: Bearer <your-jwt>"
# Expected: { "data": { "message": "API key revoked" }, "statusCode": 200 }
```

- [ ] **Step 4: Commit**

```bash
git add server/src/users/users.controller.ts
git commit -m "feat: add POST/DELETE /users/api-key endpoints"
```

---

## Task 6: Create ExpensesPublicController

**Files:**
- Create: `server/src/modules/expenses/controller/expenses-public.controller.ts`

- [ ] **Step 1: Create the file**

Create `server/src/modules/expenses/controller/expenses-public.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../auth/guards/api-key.guard.js';
import { LoggedInUser } from '../../../common/decorators/loggedin-user.decorator.js';
import type { UserDocument } from '../../../auth/schemas/user.schema.js';
import { ExpensesCrudService } from '../service/expenses-crud.service.js';
import { ExpensesQueryService } from '../service/expenses-query.service.js';
import { CreateExpenseDto } from '../dto/create-expense.dto.js';
import { UpdateExpenseDto } from '../dto/update-expense.dto.js';
import { QueryExpenseDto } from '../dto/query-expense.dto.js';

@Controller('api/v1/expenses')
@UseGuards(ApiKeyGuard)
export class ExpensesPublicController {
  constructor(
    private readonly crudService: ExpensesCrudService,
    private readonly queryService: ExpensesQueryService,
  ) {}

  @Get()
  findAll(@Query() query: QueryExpenseDto, @LoggedInUser() user: UserDocument) {
    return this.queryService.findAll(
      user._id.toString(),
      query.month,
      query.startDate,
      query.endDate,
      query.groupBy,
      query.limit,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @LoggedInUser() user: UserDocument) {
    return this.crudService.findOne(id, user._id.toString());
  }

  @Post()
  create(@Body() dto: CreateExpenseDto, @LoggedInUser() user: UserDocument) {
    return this.crudService.create(dto, user._id.toString());
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @LoggedInUser() user: UserDocument,
  ) {
    return this.crudService.update(id, dto as Record<string, unknown>, user._id.toString());
  }

  @Delete(':id')
  remove(@Param('id') id: string, @LoggedInUser() user: UserDocument) {
    return this.crudService.remove(id, user._id.toString());
  }
}
```

- [ ] **Step 2: Register the controller in ExpensesModule**

Open `server/src/modules/expenses/expenses.module.ts` and add `ExpensesPublicController` to the controllers array:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from './entities/expense.schema.js';
import { ExpensesRepository } from './repository/expenses.repository.js';
import { ExpensesCrudService } from './service/expenses-crud.service.js';
import { ExpensesQueryService } from './service/expenses-query.service.js';
import { ExpensesController } from './controller/expenses.controller.js';
import { ExpensesPublicController } from './controller/expenses-public.controller.js';
import { AuthModule } from '../../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
    AuthModule,
  ],
  controllers: [ExpensesController, ExpensesPublicController],
  providers: [ExpensesRepository, ExpensesCrudService, ExpensesQueryService],
  exports: [ExpensesQueryService, ExpensesCrudService],
})
export class ExpensesModule {}
```

- [ ] **Step 3: Build**

```bash
cd server && pnpm build
```

Expected: clean build.

- [ ] **Step 4: Smoke test with your API key**

Start the server (`pnpm start:dev`), generate an API key via the endpoint from Task 5, then:

```bash
# List expenses (returns current month by default)
curl http://localhost:8000/api/v1/expenses \
  -H "x-api-key: et_<your-key>"
# Expected: { "data": [...], "statusCode": 200 }

# Create an expense
curl -X POST http://localhost:8000/api/v1/expenses \
  -H "x-api-key: et_<your-key>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Coffee","amount":4.50,"category":"Food"}'
# Expected: { "data": { "_id": "...", "title": "Coffee", ... }, "statusCode": 201 }

# Update the expense
curl -X PATCH http://localhost:8000/api/v1/expenses/<id> \
  -H "x-api-key: et_<your-key>" \
  -H "Content-Type: application/json" \
  -d '{"amount":5.00}'
# Expected: { "data": { "amount": 5, ... }, "statusCode": 200 }

# Delete the expense
curl -X DELETE http://localhost:8000/api/v1/expenses/<id> \
  -H "x-api-key: et_<your-key>"
# Expected: { "data": { "message": "Expense deleted successfully" }, "statusCode": 200 }

# Confirm invalid key returns 401
curl http://localhost:8000/api/v1/expenses \
  -H "x-api-key: bad-key"
# Expected: { "statusCode": 401, "message": "Invalid API key" }
```

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/expenses/controller/expenses-public.controller.ts \
        server/src/modules/expenses/expenses.module.ts
git commit -m "feat: add /api/v1/expenses public controller protected by ApiKeyGuard"
```

---

## Task 7: Update web User type + usersApi

**Files:**
- Modify: `web/types/auth.ts`
- Modify: `web/lib/api/users-api.ts`

- [ ] **Step 1: Add `apiKey` to the `User` interface**

Open `web/types/auth.ts`. Add `apiKey` to the `User` interface:

```typescript
export interface User {
  id: string;
  email: string;
  createdAt: string;
  lastLoginAt?: string;
  apiKey?: string | null;
}
```

- [ ] **Step 2: Add `generateApiKey` and `revokeApiKey` to usersApi**

Replace the full content of `web/lib/api/users-api.ts`:

```typescript
import { api } from './client'

export const usersApi = {
  exportToCSV: async (): Promise<Blob> => {
    const response = await api.get('/users/export/csv', { responseType: 'blob' })
    return response.data
  },

  generateApiKey: async (): Promise<string> => {
    const response = await api.post('/users/api-key')
    return response.data.data.apiKey
  },

  revokeApiKey: async (): Promise<void> => {
    await api.delete('/users/api-key')
  },
}
```

- [ ] **Step 3: Commit**

```bash
git add web/types/auth.ts web/lib/api/users-api.ts
git commit -m "feat: add apiKey to User type and usersApi key management methods"
```

---

## Task 8: Create /developer page

**Files:**
- Create: `web/app/developer/page.tsx`

- [ ] **Step 1: Create the page**

Create `web/app/developer/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { PageLayout } from "@/shared/components/page-layout";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { useUser } from "@/features/auth";
import { usersApi } from "@/lib/api";
import { Copy, Eye, EyeOff, RefreshCw, Trash2, Check } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ENDPOINTS = [
  { method: "GET",    path: "/api/v1/expenses",     description: "List expenses (query: month, startDate, endDate, limit)" },
  { method: "GET",    path: "/api/v1/expenses/:id",  description: "Get a single expense by ID" },
  { method: "POST",   path: "/api/v1/expenses",     description: "Create an expense" },
  { method: "PATCH",  path: "/api/v1/expenses/:id",  description: "Update an expense" },
  { method: "DELETE", path: "/api/v1/expenses/:id",  description: "Delete an expense" },
];

const METHOD_COLORS: Record<string, string> = {
  GET:    "text-blue-500",
  POST:   "text-green-500",
  PATCH:  "text-yellow-500",
  DELETE: "text-red-500",
};

export default function DeveloperPage() {
  const { user, loading, refetch } = useUser();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const apiKey = user?.apiKey ?? null;

  const handleCopy = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (!confirm(apiKey ? "Regenerating will break existing integrations. Continue?" : "Generate a new API key?")) return;
    try {
      setGenerating(true);
      await usersApi.generateApiKey();
      await refetch();
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm("Revoke your API key? All integrations using it will stop working.")) return;
    try {
      setRevoking(true);
      await usersApi.revokeApiKey();
      await refetch();
      setVisible(false);
    } finally {
      setRevoking(false);
    }
  };

  const maskedKey = apiKey ? `et_${"•".repeat(20)}` : null;

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center py-12"><Spinner /></div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* API Key */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">API Key</p>

            {apiKey ? (
              <>
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 font-mono text-sm">
                  <span className="flex-1 truncate">
                    {visible ? apiKey : maskedKey}
                  </span>
                  <button onClick={() => setVisible(v => !v)} className="text-muted-foreground hover:text-foreground shrink-0">
                    {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground shrink-0">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
                    {generating ? <Spinner size="sm" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Regenerate
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={handleRevoke} disabled={revoking}>
                    {revoking ? <Spinner size="sm" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Revoke
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">No API key yet. Generate one to connect external tools.</p>
                <Button size="sm" onClick={handleGenerate} disabled={generating}>
                  {generating ? <Spinner size="sm" /> : null}
                  Generate API key
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Base URL */}
        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Base URL</p>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 font-mono text-sm">
              <span className="flex-1">{API_BASE}</span>
            </div>
            <p className="text-xs text-muted-foreground">Pass your key as the <code className="bg-muted px-1 rounded">x-api-key</code> header on every request.</p>
          </CardContent>
        </Card>

        {/* Endpoint reference */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Endpoints</p>
            <div className="divide-y divide-border rounded-lg border overflow-hidden">
              {ENDPOINTS.map((e) => (
                <div key={e.method + e.path} className="flex items-start gap-3 px-4 py-3 text-sm">
                  <span className={`font-mono font-semibold w-14 shrink-0 ${METHOD_COLORS[e.method]}`}>{e.method}</span>
                  <span className="font-mono text-foreground w-52 shrink-0 truncate">{e.path}</span>
                  <span className="text-muted-foreground">{e.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick start */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Start — curl</p>
            <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto leading-relaxed">{`# Add an expense
curl -X POST ${API_BASE}/api/v1/expenses \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Coffee","amount":4.50,"category":"Food"}'

# List this month's expenses
curl ${API_BASE}/api/v1/expenses \\
  -H "x-api-key: YOUR_API_KEY"

# List by date range
curl "${API_BASE}/api/v1/expenses?startDate=2026-07-01&endDate=2026-07-31" \\
  -H "x-api-key: YOUR_API_KEY"`}</pre>

            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">n8n HTTP Request node</p>
            <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto leading-relaxed">{`Method:  POST
URL:     ${API_BASE}/api/v1/expenses
Headers: x-api-key = {{ $env.EXPENSE_API_KEY }}
Body (JSON):
{
  "title":    "{{ $json.title }}",
  "amount":   {{ $json.amount }},
  "category": "{{ $json.category }}"
}`}</pre>
          </CardContent>
        </Card>

      </div>
    </PageLayout>
  );
}
```

- [ ] **Step 2: Start the dev server and open the page**

```bash
cd web && pnpm dev
```

Open `http://localhost:3001/developer` in a browser (you must be logged in).

Verify:
- "No API key yet" state shown when no key exists
- "Generate API key" button works: key appears after click
- Show/hide toggle masks and reveals the key
- Copy button copies to clipboard and shows checkmark briefly
- Regenerate prompts confirmation, then shows the new key
- Revoke prompts confirmation, then returns to the empty state

- [ ] **Step 3: Commit**

```bash
git add web/app/developer/page.tsx
git commit -m "feat: add /developer page with API key management and endpoint docs"
```

---

## Task 9: Add Developer link on profile page

**Files:**
- Modify: `web/app/profile/page.tsx`

- [ ] **Step 1: Add the import and link**

At the top of `web/app/profile/page.tsx`, add `Link` and `Code2` to existing imports:

```tsx
import { LogOut, Download, Upload, Sun, Moon, Code2 } from "lucide-react";
import Link from "next/link";
```

Then, inside the `/* Data */` section (after the `BulkImportDialog` block, before the closing `</div>` of that section), add:

```tsx
<Link href="/developer" className="w-full">
  <Button variant="ghost" className="w-full justify-start gap-3">
    <Code2 className="w-4 h-4" />
    Developer API
  </Button>
</Link>
```

- [ ] **Step 2: Verify in browser**

With the dev server running, open `http://localhost:3001/profile`.

Confirm the "Developer API" button appears in the Data section and clicking it navigates to `/developer`.

- [ ] **Step 3: Commit**

```bash
git add web/app/profile/page.tsx
git commit -m "feat: add Developer API link to profile page"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered in |
|---|---|
| `apiKey` field on User schema | Task 1 |
| `generateApiKey` / `revokeApiKey` on AuthService | Task 2 |
| `getLoggedInUser` returns `apiKey` | Task 2, Step 3 |
| `ApiKeyGuard` reads `x-api-key` header | Task 3 |
| `ApiKeyGuard` exported from `AuthModule` | Task 4 |
| `POST /users/api-key` and `DELETE /users/api-key` | Task 5 |
| `/api/v1/expenses` full CRUD | Task 6 |
| `401` for missing/invalid key | Task 6, Step 4 smoke test |
| Web `User` type includes `apiKey` | Task 7 |
| `usersApi.generateApiKey` / `revokeApiKey` | Task 7 |
| `/developer` page with key display, copy, generate, revoke | Task 8 |
| Base URL display | Task 8 |
| Endpoint reference table | Task 8 |
| curl + n8n quick start | Task 8 |
| Profile page Developer link | Task 9 |

All spec requirements are covered. No gaps.
