# Developer API Key Access — Design Spec
**Date:** 2026-07-12
**Status:** Approved

## Goal

Give each user a personal API key so they can programmatically manage their expenses from external tools — primarily n8n automation workflows and a Telegram bot.

---

## Decisions Made

| Question | Decision |
|---|---|
| Auth separation | Separate `/api/v1/` prefix with its own `ApiKeyGuard`; JWT routes untouched |
| Docs location | In-app `/developer` page |
| Supported operations | Full CRUD: list, get, create, update, delete |
| Key management | One key per user; regenerate = revoke |
| Key storage | Plain text on User document (personal tool, UX simplicity) |

---

## Data Layer

**`User` schema** — add one optional field:

```ts
@Prop()
apiKey?: string;
```

**Format:** `et_` + `crypto.randomBytes(32).toString('hex')` → 68 chars total.

No new collections. No new module.

---

## Server

### 1. `UsersService` — two new methods

```
generateApiKey(userId)  → overwrites apiKey field, returns new key
revokeApiKey(userId)    → sets apiKey to undefined
```

### 2. `UsersController` — two new endpoints

```
POST   /users/api-key   @UseGuards(JwtAuthGuard)  → generate / regenerate
DELETE /users/api-key   @UseGuards(JwtAuthGuard)  → revoke
```

Both require the user to be logged in via the normal JWT session (web app calls these).

### 3. `ApiKeyGuard`

Location: `server/src/auth/guards/api-key.guard.ts`

- Reads `x-api-key` header
- Looks up `User.findOne({ apiKey: value })`
- Attaches user to request (same shape as `JwtAuthGuard`)
- Returns `401` if key missing or not found

### 4. Public Expenses Controller

Location: `server/src/modules/expenses/controller/expenses-public.controller.ts`

Prefix: `/api/v1/expenses`  
Guard: `ApiKeyGuard`  
Reuses: `ExpensesCrudService`, `ExpensesQueryService` (zero changes to existing services)

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/expenses` | List expenses (query: `category`, `startDate`, `endDate`, `page`, `limit`) |
| GET | `/api/v1/expenses/:id` | Get single expense |
| POST | `/api/v1/expenses` | Create expense |
| PATCH | `/api/v1/expenses/:id` | Update expense |
| DELETE | `/api/v1/expenses/:id` | Delete expense |

Request/response shapes are identical to the existing JWT-protected expense endpoints.

---

## Web

### 1. Navigation

Add a "Developer" link on the profile page pointing to `/developer`.

### 2. `/developer` Page

Sections:

**API Key**
- Masked key display (`et_••••••••••••••••••` with show/hide toggle)
- Copy-to-clipboard button
- "Regenerate" button (with confirmation prompt — regenerating breaks existing integrations)
- "Revoke" button to clear the key entirely
- Empty state when no key exists: "Generate your first API key"

**Base URL**
- Shows the server base URL (e.g. `https://your-api.com`)

**Endpoint Reference**
- Table of all 5 endpoints with method, path, description
- Request body example for POST and PATCH (JSON)
- Response shape example

**Quick Start (n8n / curl)**
- Two collapsible code blocks:
  - `curl` example for adding an expense
  - n8n HTTP Request node screenshot or config snippet

### 3. API helpers (`web/lib/api`)

```
usersApi.generateApiKey()   → POST /users/api-key
usersApi.revokeApiKey()     → DELETE /users/api-key
```

---

## Error Handling

| Scenario | Response |
|---|---|
| Missing `x-api-key` header | `401 Unauthorized` |
| Key not found in DB | `401 Unauthorized` |
| Valid key, invalid body | `400 Bad Request` (existing validation) |
| Expense not owned by key's user | `404 Not Found` (existing ownership check) |

---

## Out of Scope (for now)

- Rate limiting on API key routes
- Multiple named keys per user
- Key expiry / last-used tracking
- Scopes (read-only vs read-write keys)
- API versioning beyond `/api/v1/`
