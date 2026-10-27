# Developer Guide — sale Frontend SPA

**Audience:** Developers joining the project or extending existing UI features.  
**Last updated:** 2026-08-30  
**Companion docs:** [`module-development-workflow.md`](./module-development-workflow.md) · [`MEMORY.md`](../MEMORY.md) · [`context/`](../context/) · [`backend/docs/developer-guide.md`](../../backend/docs/developer-guide.md)

**Reference implementation:** UI patterns follow [`warehouse-frontend`](../../warehouse-frontend/) (Vue 3 + Naive UI + Pinia).  
**API source of truth:** [`backend/`](../backend/) OpenAPI at `http://localhost:5064/swagger`.

---

## Table of contents

> **New module?** Start with [`module-development-workflow.md`](./module-development-workflow.md) for the step-by-step implementation guide (Products as reference).

1. [Architecture at a glance](#1-architecture-at-a-glance)
2. [Project structure](#2-project-structure)
3. [How a user action flows through the app](#3-how-a-user-action-flows-through-the-app)
4. [Walkthrough: editing a product](#4-walkthrough-editing-a-product)
5. [Layer-by-layer reference](#5-layer-by-layer-reference)
6. [Authentication and authorization](#6-authentication-and-authorization)
7. [Error handling](#7-error-handling)
8. [Changing existing functionality](#8-changing-existing-functionality)
9. [Adding a new feature](#9-adding-a-new-feature)
10. [Testing expectations](#10-testing-expectations)
11. [Conventions checklist](#11-conventions-checklist)
12. [Quick reference — all files involved](#12-quick-reference--all-files-involved)

---

## 1. Architecture at a glance

The frontend is a **Vue 3 SPA** that talks to the sale .NET REST API over HTTP.

| Concern | Technology |
|---------|------------|
| Framework | Vue 3.5 (`<script setup>`, Composition API) |
| Build | Vite 8 + TypeScript 6 |
| UI | Naive UI 2.x |
| State | Pinia 3 (composition stores) |
| Routing | Vue Router 4 (lazy routes, `keepAlive` meta) |
| HTTP | Axios (shared client + interceptors) |
| i18n | vue-i18n 9 (English + Persian, RTL) |
| Icons | `@vicons/ionicons5`, `@vicons/carbon` |

### Dependency rule

```text
  Views (pages)
       │
       ├── composables (usePermission, useDateFormat)
       ├── stores (auth, theme)
       ├── api/* (domain HTTP modules)
       │      └── api/client.ts (Axios + interceptors)
       └── types/* (DTOs / interfaces)
```

**Views call API modules — not Axios directly.**  
**Business rules stay on the backend** — the SPA handles presentation, navigation, form validation (UX), and permission-gated UI.

### What the frontend does NOT do

- Enforce authorization (backend `[Permission]` is authoritative)
- Compute order totals or other server-owned aggregates
- Duplicate domain invariants from C# entities

---

## 2. Project structure

```text
frontend/
  docs/
    developer-guide.md          ← this file
  public/
    favicon.svg
  src/
    api/
      client.ts                 Shared Axios instance + 401 refresh queue
      auth.ts                   login, refresh, logout, me
      users.ts                  /api/v1/users/*
      roles.ts                  /api/v1/roles/*
      products.ts               /api/v1/products/*
      orders.ts                 /api/v1/orders/*
    assets/styles/
      global.css                page-header, RTL helpers, table scroll
    components/layout/
      AppLayout.vue             Sidebar, breadcrumbs, user menu, keep-alive outlet
    composables/
      usePermission.ts          hasPermission / hasAnyPermission
      useDateFormat.ts          Jalali/Gregorian formatting
    i18n/
      index.ts, en.ts, fa.ts
    router/
      index.ts                  Routes + auth/permission guards
    stores/
      auth.ts                   JWT session, permissions, refresh timers
      theme.ts                  Light/dark toggle
    types/
      auth.ts, user.ts, role.ts, product.ts, order.ts, common.ts
    utils/
      error.ts                  getApiError() for ProblemDetails
      persianDigits.ts
    views/
      auth/LoginView.vue
      dashboard/DashboardView.vue
      products/ProductList.vue
      orders/OrderList.vue, OrderDetail.vue
      admin/AdminDashboard.vue, UserManagement.vue, RoleManagement.vue
      not-found/NotFound.vue
    App.vue                     Naive UI theme provider, i18n RTL
    main.ts                     App bootstrap
  .env.development              VITE_API_URL=/api/v1
  .env.example
  vite.config.ts                Dev proxy → backend :5064
  nginx.conf                    Production static + /api proxy
  package.json
```

---

## 3. How a user action flows through the app

Example: user clicks **Save** on the product edit modal.

```text
  User clicks Save
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ View (ProductList.vue)                                       │
│  1. Naive form validate (client-side UX rules)               │
│  2. productApi.update(id, payload)                           │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ api/client.ts interceptors                                   │
│  Request:  attach Authorization: Bearer {accessToken}        │
│            attach Accept-Language from localStorage          │
│  Response: on 401 → refreshToken queue → retry or /login     │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ Vite dev proxy (development only)                            │
│  /api/* → http://localhost:5064/api/*                        │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ Backend API (see backend/docs/developer-guide.md)            │
│  JWT auth → permission check → service → DB                  │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ View handles response                                        │
│  Success → message.success, close modal, reload table        │
│  Error   → getApiError(e) → message.error                    │
└──────────────────────────────────────────────────────────────┘
```

### HTTP status handling (frontend responsibility)

| Status | Frontend behavior |
|--------|-------------------|
| 401 | Axios interceptor tries refresh; on failure → logout + redirect `/login` |
| 403 | Show error message; do not retry (user lacks permission) |
| 400 | Show `getApiError()` message (ProblemDetails `title` / `errors`) |
| 404 | Show not-found message; optionally redirect |
| 409 | Show conflict message from API |
| 2xx | Update local state / reload list |

---

## 4. Walkthrough: editing a product

This flow demonstrates routing, permissions, API integration, forms, and error display.

### 4.1 Route and permission gate

**File:** `src/router/index.ts`

```typescript
{
  path: 'products',
  name: 'Products',
  meta: { keepAlive: true, permission: 'products.read' },
  component: () => import('../views/products/ProductList.vue'),
}
```

`router.beforeEach`:

1. Unauthenticated users → `/login`
2. Route with `meta.permission` and missing claim → `/` (dashboard)
3. Authenticated + allowed → render view inside `AppLayout`

The sidebar menu in `AppLayout.vue` also hides **Products** unless `hasPermission('products.read')`.

### 4.2 Page layout pattern

**File:** `src/views/products/ProductList.vue`

Standard list page structure (same as `warehouse-frontend` admin views):

| Section | Purpose |
|---------|---------|
| `.page-header` | Title + primary action button (permission-gated) |
| Filters | Search, selects — call `reload()` |
| `n-data-table` | Remote pagination via `@update:page` |
| `n-modal` + `n-form` | Create/edit dialog |

Primary actions (example — products use sync, not create):

```vue
<n-button v-if="hasPermission('products.update')" type="primary" @click="runSync">
```

Row actions use `products.update` for edit/status. Catalog modules without delete follow the same permission pattern.

### 4.3 API module

**File:** `src/api/products.ts`

```typescript
export const productApi = {
  getAll: (params?: ProductListQuery) =>
    client.get<PagedResponse<ProductListItem>>('/products', { params }),
  update: (id: number, data: UpdateProductRequest) =>
    client.put<ProductDetail>(`/products/${id}`, data),
  // create, delete, getById ...
}
```

All paths are relative to `baseURL` (`/api/v1`), matching backend controllers.

**Types** live in `src/types/product.ts` and mirror backend DTO field names (camelCase JSON).

### 4.4 Submit handler

```typescript
async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return false  // keep modal open
  }
  submitting.value = true
  try {
    if (editing.value) {
      await productApi.update(editing.value.id, { ... })
    } else {
      await productApi.create({ ... })
    }
    message.success(t('common.success'))
    showModal.value = false
    await loadData()
  } catch (e) {
    message.error(getApiError(e) || t('common.error'))
    return false  // prevent modal auto-close
  } finally {
    submitting.value = false
  }
}
```

**Rules:**

- Validate with Naive `FormRules` before calling API
- Use `getApiError()` for server messages
- Return `false` from modal `@positive-click` when validation/API fails
- Reload list after success — do not mutate row optimistically unless you have a strong reason

### 4.5 List loading with pagination

```typescript
async function loadData() {
  loading.value = true
  try {
    const res = await productApi.getAll({
      page: page.value,
      pageSize: pageSize.value,
      search: search.value || undefined,
      productType: filterType.value ?? undefined,
      isActive: filterActive.value ?? undefined,
    })
    products.value = res.data.items
    totalCount.value = res.data.totalCount
  } finally {
    loading.value = false
  }
}
```

Backend returns `PagedResponse`: `{ items, page, pageSize, totalCount, totalPages }`.

---

## 5. Layer-by-layer reference

### Views — what belongs here

| Concern | Location |
|---------|----------|
| Page UI | `src/views/{domain}/*.vue` |
| Table columns | `computed<DataTableColumns<T>>` in view script |
| Modals / forms | Same view file (warehouse pattern) |
| Permission gates | `usePermission()` in template and column renderers |
| i18n strings | `useI18n()` → `t('...')` keys in `src/i18n/en.ts` + `fa.ts` |

### API layer — what belongs here

| Concern | Location |
|---------|----------|
| Axios instance | `src/api/client.ts` |
| Domain endpoints | `src/api/{domain}.ts` — one export object per backend module |
| Base URL | `import.meta.env.VITE_API_URL` (default `/api/v1`) |

**Do not** create a second HTTP client. Import `client` from `./client`.

### Stores — what belongs here

| Store | Responsibility |
|-------|----------------|
| `auth.ts` | Tokens, `userInfo`, `permissions[]`, login/logout/refresh, localStorage persistence |
| `theme.ts` | `isDark`, toggle, persisted preference |

Session data in `localStorage`: `token`, `refreshToken`, `tokenIssuedAt`, `tokenExpiresInSeconds`, `userInfo`, `permissions`, `locale`, `theme`.

### Composables — what belongs here

| Composable | Use when |
|------------|----------|
| `usePermission()` | Checking `users.read`, gating buttons/menus |
| `useDateFormat()` | Formatting `createdAt` / `updatedAt` in tables |
| `AppDatePicker` | Date **selection** in forms — Jalali when `fa`, Gregorian when `en` |

### Types — what belongs here

Mirror backend DTOs as TypeScript interfaces in `src/types/`. Keep request/response types close to Swagger definitions.

When backend adds a field, update:

1. `src/types/{domain}.ts`
2. Form model + table columns in the view
3. API call payload

---

## 6. Authentication and authorization

### Login flow

**Files:** `src/views/auth/LoginView.vue`, `src/stores/auth.ts`, `src/api/auth.ts`

```text
1. User submits email + password
2. POST /api/v1/auth/login
   → { accessToken, refreshToken, expiresInSeconds, refreshExpiresInSeconds }
3. GET /api/v1/auth/me
   → { id, username, email, roleId, roleName, permissions[] }
4. Persist to Pinia + localStorage
5. router.push('/')
```

Login uses **email** (not username) — sale backend contract differs from `warehouse-frontend`.

### Token refresh

**File:** `src/api/client.ts`

On **401** (except login/refresh endpoints):

1. If already refreshing → queue request until new token arrives
2. Else call `authStore.refreshToken()` → `POST /api/v1/auth/refresh` with `{ refreshToken }`
3. Retry original request with new Bearer token
4. On refresh failure → logout + redirect `/login`

Silent refresh also runs on a timer and on user activity when token is past 50% of its lifetime (`stores/auth.ts`).

### Permission model

Permissions are a **flat string array** from `/auth/me`:

```text
users.read | users.create | users.update | users.delete
products.read | products.update
orders.read | orders.create | orders.update | orders.cancel | orders.change_status
roles.list | roles.read | roles.create | roles.update | roles.toggle_permission
auth.me | auth.logout
```

Check in UI:

```typescript
const { hasPermission, hasAnyPermission } = usePermission()

if (hasPermission('products.update')) { /* show sync or edit */ }
```

**Three layers of gating:**

| Layer | File | Purpose |
|-------|------|---------|
| Route | `router/index.ts` `meta.permission` | Block direct URL access |
| Menu | `AppLayout.vue` | Hide nav items |
| Actions | View templates / table columns | Hide create/edit/delete buttons |

Backend always enforces the real policy — UI gates are UX only.

---

## 7. Error handling

**File:** `src/utils/error.ts`

```typescript
export function getApiError(e: unknown): string | null {
  const data = err?.response?.data
  // ProblemDetails: title + errors map
  // Fallback: detail, string body
}
```

Backend may return:

**RFC 9457 ProblemDetails** (from `ToProblemResult`):

```json
{
  "title": "Resource not found",
  "status": 404,
  "detail": "Product with id 42 was not found.",
  "traceId": "...",
  "correlationId": "..."
}
```

**Validation ErrorResponse** (from FluentValidation):

```json
{
  "statusCode": 400,
  "message": "Validation failed.",
  "errors": {
    "Name": ["'Name' must not be empty."]
  }
}
```

`getApiError` flattens `errors` into a single message for `message.error()`.

### Display pattern

```typescript
try {
  await productApi.update(id, payload)
  message.success(t('common.success'))
} catch (e) {
  message.error(getApiError(e) || t('common.error'))
}
```

For field-level mapping (future enhancement), read `error.response.data.errors` directly in the form.

---

## 8. Changing existing functionality

### Example: Add a column to the products table

| Step | File(s) |
|------|---------|
| 1. Confirm field exists in backend DTO | Swagger / `backend` ProductListItemDto |
| 2. Update TypeScript type | `src/types/product.ts` → `ProductListItem` |
| 3. Add table column | `src/views/products/ProductList.vue` → `columns` computed |
| 4. Add i18n label | `src/i18n/en.ts`, `src/i18n/fa.ts` |
| 5. Verify in browser | Login as Admin → Products page |

### Example: Add a form field to product edit

| Step | File(s) |
|------|---------|
| 1. Backend DTO + validator | (backend change first) |
| 2. `UpdateProductRequest` type | `src/types/product.ts` |
| 3. Form model + `n-form-item` | `ProductList.vue` |
| 4. Include in `productApi.update(...)` payload | Same view |
| 5. Optional: client validation rule | `rules` in view |

### Example: Restrict a button to Admin only

Prefer backend permission changes. On frontend, gate with the permission string the backend already exposes — do not hardcode role names like `'Admin'` in views.

---

## 9. Adding a new feature

Follow the vertical slice used by Products/Orders/Users:

```text
1. Read backend endpoint in Swagger (method, path, DTO, permission)
2. Add/update types in src/types/{domain}.ts
3. Add API functions in src/api/{domain}.ts
4. Create view in src/views/{domain}/
5. Register route in src/router/index.ts (meta.permission if protected)
6. Add menu entry in AppLayout.vue (hasPermission gate)
7. Add i18n keys in en.ts + fa.ts
8. Manual test with seeded users (Admin, Manager, Sales, User)
```

### API module template

```typescript
import client from './client'
import type { YourDetail, CreateYourRequest } from '../types/your'

export const yourApi = {
  getAll: (params?: YourListQuery) =>
    client.get<PagedResponse<YourListItem>>('/your-path', { params }),
  create: (data: CreateYourRequest) =>
    client.post<YourDetail>('/your-path', data),
}
```

### View template (list + modal)

Copy structure from:

- `src/views/products/ProductList.vue` — CRUD list
- `src/views/orders/OrderDetail.vue` — detail + actions
- `src/views/admin/UserManagement.vue` — admin table with multiple modals

### Route template

```typescript
{
  path: 'your-feature',
  name: 'YourFeature',
  meta: { keepAlive: true, permission: 'your.read' },
  component: () => import('../views/your/YourList.vue'),
}
```

---

## 10. Testing expectations

| Check | Command / action |
|-------|------------------|
| TypeScript compiles | `npm run build` |
| Dev server starts | `npm run dev` |
| Login works | `admin` / `ChangeMe-Admin123!` |
| Permission matrix | Test Admin vs User for gated routes/buttons |
| API contract | Compare network tab with Swagger |

Before submitting frontend changes:

```bash
cd frontend
npm run build
```

Manual smoke test checklist:

```text
[ ] Login / logout
[ ] Token refresh (wait or force 401 — should recover or redirect login)
[ ] Dashboard counts load for permitted modules
[ ] Products CRUD (Admin)
[ ] Orders create / confirm / cancel
[ ] Admin users + roles (Admin)
[ ] Persian locale + RTL layout
[ ] Dark/light theme toggle
```

Vitest is not configured yet — follow `warehouse-frontend` if adding unit tests later.

---

## 11. Conventions checklist

```text
[ ] Match warehouse-frontend patterns before inventing new abstractions
[ ] Views call api/* modules — not axios directly
[ ] Types mirror backend DTOs (Swagger is source of truth)
[ ] Permission gates on routes, menus, and destructive actions
[ ] Use getApiError() for API failure messages
[ ] i18n: add both en.ts and fa.ts keys
[ ] RTL: set dir on table wrappers when locale === 'fa'
[ ] Date fields use `AppDatePicker` (Jalali in `fa`, Gregorian in `en`; not raw `n-date-picker`)
[ ] keepAlive on list routes that should preserve scroll/state
[ ] Do not duplicate backend business rules in the SPA
[ ] npm run build passes
```

### Naming conventions

| Item | Convention |
|------|------------|
| Vue files | PascalCase (`ProductList.vue`) |
| API modules | camelCase export (`productApi`) |
| Types | PascalCase interfaces (`ProductListItem`) |
| i18n keys | dot notation (`products.title`) |
| Permissions | backend strings verbatim (`products.read`) |

---

## 12. Quick reference — all files involved

| Concern | File |
|---------|------|
| **App bootstrap** | `src/main.ts` |
| Theme + i18n provider | `src/App.vue` |
| Axios client + 401 refresh | `src/api/client.ts` |
| Auth endpoints | `src/api/auth.ts` |
| Users / Roles / Products / Orders | `src/api/users.ts`, `roles.ts`, `products.ts`, `orders.ts` |
| Auth store | `src/stores/auth.ts` |
| Theme store | `src/stores/theme.ts` |
| Permission helper | `src/composables/usePermission.ts` |
| Date formatting | `src/composables/useDateFormat.ts` |
| Date pickers | `src/components/AppDatePicker.vue` |
| Router + guards | `src/router/index.ts` |
| Shell layout + menu | `src/components/layout/AppLayout.vue` |
| Login page | `src/views/auth/LoginView.vue` |
| Product CRUD example | `src/views/products/ProductList.vue` |
| Order list + create | `src/views/orders/OrderList.vue` |
| Order detail + actions | `src/views/orders/OrderDetail.vue` |
| Admin tabs | `src/views/admin/AdminDashboard.vue` |
| User admin | `src/views/admin/UserManagement.vue` |
| Role + permission toggles | `src/views/admin/RoleManagement.vue` |
| API error helper | `src/utils/error.ts` |
| Global styles | `src/assets/styles/global.css` |
| English / Persian strings | `src/i18n/en.ts`, `src/i18n/fa.ts` |
| Env var | `.env.development` → `VITE_API_URL=/api/v1` |
| Dev proxy | `vite.config.ts` |
| Production nginx | `nginx.conf` |

---

## Local development

### Prerequisites

- Node.js 20+ (LTS recommended)
- Backend running with PostgreSQL (Docker Compose)

### Start backend

```bash
cd backend
docker compose up -d
dotnet run --project src/Sale.Api --launch-profile http
```

Use the **http** launch profile. In Development, HTTPS redirection is disabled so the Vite proxy can forward `/api` without stripping the `Authorization` header on redirect.

Swagger: `http://localhost:5064/swagger`

### Start frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (default `http://localhost:5173`).

The dev server proxies:

```text
/api/*  →  http://localhost:5064/api/*
```

### Seed credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin` | `ChangeMe-Admin123!` |
| Manager | `manager@example.com` | `ChangeMe-Manager123!` |
| Sales | `sales@example.com` | `ChangeMe-Sales123!` |
| User | `user@example.com` | `ChangeMe-User123!` |

### Production build

```bash
cd frontend
npm run build    # outputs to dist/
npm run preview  # local preview of production bundle
```

Serve `dist/` via `nginx.conf` (static files + `/api/` reverse proxy to backend).

---

## Backend API map (frontend coverage)

| Module | API base | Frontend view | Permission(s) |
|--------|----------|---------------|---------------|
| Auth | `/api/v1/auth/*` | `LoginView`, auth store | `auth.me`, `auth.logout` |
| Users | `/api/v1/users` | `UserManagement.vue` | `users.*` |
| Roles | `/api/v1/roles` | `RoleManagement.vue` | `roles.*` |
| Products | `/api/v1/products` | `ProductList.vue` | `products.*` |
| Orders | `/api/v1/orders` | `OrderList.vue`, `OrderDetail.vue` | `orders.*` |

For full endpoint details (request bodies, status codes, DTO shapes), see [`context/05-api-integration.md`](../context/05-api-integration.md) and backend Swagger.

---

*For backend internals see [`backend/docs/developer-guide.md`](../../backend/docs/developer-guide.md). For agent-oriented context see [`context/`](../context/) and [`MEMORY.md`](../MEMORY.md).*
