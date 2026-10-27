# Module Development Workflow (Frontend)

**Audience:** Developers adding a new UI module or extending an existing feature in the Vue.js SPA.  
**Reference implementation:** Products module (`List`, `Create`, `Update` via `ProductList.vue`).  
**Last updated:** 2026-08-31  
**Companion docs:** [`developer-guide.md`](./developer-guide.md) · [`context/05-api-integration.md`](../context/05-api-integration.md) · [`context/06-auth-and-permissions.md`](../context/06-auth-and-permissions.md) · [`backend/docs/module-development-workflow.md`](../../backend/docs/module-development-workflow.md)

This document describes the **end-to-end frontend workflow** for implementing a feature that consumes the sale .NET REST API — from reading the backend contract through to a permission-gated, i18n-ready page. Follow the steps **in order**. The **backend API is the source of truth** for shapes, permissions, and business rules.

---

## Table of contents

1. [Architecture overview](#1-architecture-overview)
2. [Before you start](#2-before-you-start)
3. [Implementation workflow (12 steps)](#3-implementation-workflow-12-steps)
4. [New module file checklist](#4-new-module-file-checklist)
5. [User action flow reference](#5-user-action-flow-reference)
6. [Rules of thumb](#6-rules-of-thumb)
7. [Completion checklist](#7-completion-checklist)

---

## 1. Architecture overview

### Layer dependency

```text
  View (page)
       │
       ├── composables/     usePermission, useDateFormat
       ├── stores/          auth (JWT, permissions), theme
       ├── api/{module}.ts  domain HTTP functions
       │      └── api/client.ts   Axios + Bearer + 401 refresh
       ├── types/{module}.ts     TypeScript DTOs
       └── i18n/            en.ts, fa.ts
```

- **Views call `api/*` modules** — never import Axios directly in views.
- **Business rules stay on the backend** — the SPA handles UI, navigation, UX validation, and permission-gated visibility.
- **Permissions from `/auth/me`** gate routes and buttons; backend `[Permission]` is authoritative.

### Pattern used by Products, Orders, Users

```text
User action → View → productApi.* → client (Axios) → /api/v1/* → .NET API
                ↑
         usePermission / router guards / i18n / getApiError
```

### Coordination with backend

When adding a full-stack feature, implement the **backend module first** (see `backend/docs/module-development-workflow.md`), then implement the frontend slice using Swagger as the contract.

---

## 2. Before you start

1. **Confirm backend endpoint exists** — Swagger at `http://localhost:5064/swagger` or `frontend/context/05-api-integration.md`.
2. **Find a similar UI module** — use codebase-memory MCP (`search_graph` on `C-sarayi-sale-frontend`) or read `src/views/products/ProductList.vue`.
3. **Read context docs** — `04-coding-rules.md`, `05-api-integration.md`, `06-auth-and-permissions.md`.
4. **Know the permission strings** — must match backend `PermissionIdentifiers` exactly (e.g. `products.read`, `products.create`).
5. **Do not duplicate backend logic** — no client-side totals, duplicate-code checks, or authorization decisions.

---

## 3. Implementation workflow (12 steps)

Use **Products** as the primary template. Replace `Product` / `products` with your module name.

---

### Step 1 — Backend API contract

**Purpose:** The frontend mirrors the REST API — it does not invent request/response shapes.

**Products reference (sync-only catalog):**

| Concern | Source |
|---------|--------|
| Endpoints | `GET /api/v1/products`, `GET/PUT /api/v1/products/{id}`, `POST /api/v1/products/sync` |
| List query params | `page`, `pageSize`, `sortBy`, `sortDirection` |
| Permissions | `products.read`, `products.update` (sync uses `products.update`) |
| Docs | `frontend/context/05-api-integration.md`, `docs/company-products-weighbridge-sync.md` |

**Checklist:**

- [ ] HTTP method and path for each operation
- [ ] Request body fields (create vs update)
- [ ] Response DTO fields (list item vs detail)
- [ ] Pagination wrapper shape (`items`, `page`, `pageSize`, `totalCount`, `totalPages`)
- [ ] Permission string per operation
- [ ] Error statuses: 400 validation, 401 unauthorized, 403 forbidden, 404 not found, 409 conflict

**Rule:** If the backend DTO changes, update `src/types/` first — then API module, then views.

---

### Step 2 — TypeScript types (DTOs)

**Purpose:** Type-safe contracts between API layer and views.

**Products reference:** `src/types/product.ts`

Define interfaces that mirror backend DTOs:

| Type | Purpose |
|------|---------|
| `{Entity}ListItem` | Row in paginated table |
| `{Entity}Detail` | Single-entity response (if different from list item) |
| `Create{Entity}Request` | POST body |
| `Update{Entity}Request` | PUT body |
| `{Entity}ListQuery` | Query string params for list |

**Products example:**

```typescript
export interface ProductListItem {
  id: number
  name: string
  code: string
  productType: number
  productTypeText: string
  isActive: boolean
  createdAt: string
  // ...
}

export interface CreateProductRequest {
  name: string
  code: string
  productType: number
  section?: string | null
  productCategory?: string | null
}
```

**Optional:** module constants (e.g. `PRODUCT_TYPES` with `labelKey` for i18n).

**Shared types:** `PagedResponse<T>` and `ListQueryParams` live in `src/types/common.ts`.

---

### Step 3 — API module

**Purpose:** One place for all HTTP calls to a backend area.

**Products reference:** `src/api/products.ts`

**Pattern:**

```typescript
import client from './client'
import type { PagedResponse } from '../types/common'
import type { CreateProductRequest, ProductDetail, ProductListItem, ProductListQuery, UpdateProductRequest } from '../types/product'

export const productApi = {
  getAll: (params?: ProductListQuery) =>
    client.get<PagedResponse<ProductListItem>>('/products', { params }),
  getById: (id: number) => client.get<ProductDetail>(`/products/${id}`),
  create: (data: CreateProductRequest) => client.post<ProductDetail>('/products', data),
  update: (id: number, data: UpdateProductRequest) => client.put<ProductDetail>(`/products/${id}`, data),
  delete: (id: number) => client.delete(`/products/${id}`),
}
```

**Rules:**

- Export a single object (`productApi`, `orderApi`, etc.) — one function per API operation
- Paths are relative to `baseURL` (`/api/v1`) — do not repeat `/api/v1` in each call
- All HTTP goes through `src/api/client.ts` (Bearer token, `Accept-Language`, 401 refresh queue)
- Use TypeScript generics on `client.get/post/put/delete` for response typing

**Do not** call `axios.create()` or `fetch()` from views.

---

### Step 4 — Internationalization (i18n)

**Purpose:** All user-facing text in English and Persian (RTL default).

**Products reference:** `src/i18n/en.ts`, `src/i18n/fa.ts` — `products.*` keys

**Checklist:**

- [ ] Page title (`products.title`)
- [ ] Field labels (`products.name`, `products.code`, …)
- [ ] Button labels (use `common.create`, `common.save`, `common.delete` where possible)
- [ ] Nav menu label (`nav.products`)
- [ ] Enum display labels (`products.type1`, `products.type2`)
- [ ] Validation messages (`fieldRequired` with `{ field }` interpolation)

**Usage in views:**

```typescript
const { t, locale } = useI18n()
// template: {{ t('products.title') }}
```

**RTL:** Wrap data tables with `:dir="locale === 'fa' ? 'rtl' : 'ltr'"` on a wrapper div.

---

### Step 5 — Router registration

**Purpose:** Map URL to view; enforce authentication and read permission.

**Products reference:** `src/router/index.ts`

```typescript
{
  path: 'products',
  name: 'Products',
  meta: { keepAlive: true, permission: 'products.read' },
  component: () => import('../views/products/ProductList.vue'),
},
```

**Meta flags:**

| Meta | Purpose |
|------|---------|
| `requiresAuth: false` | Public route (login only) |
| `requiresAuth: true` | Default for layout children |
| `permission: 'products.read'` | Redirect to `/` if user lacks permission |
| `keepAlive: true` | Preserve list state on navigation away |

**Guards** (already in `router/index.ts`):

1. Unauthenticated → `/login`
2. Authenticated on `/login` → `/`
3. Missing `meta.permission` → `/`

**Detail routes:** use `path: 'orders/:id'` with `meta.permission` (see Orders module).

---

### Step 6 — Navigation menu

**Purpose:** Show module in sidebar only when user can read it.

**Products reference:** `src/components/layout/AppLayout.vue`

```typescript
if (hasPermission('products.read')) {
  items.push({ label: t('nav.products'), key: 'Products', icon: renderIcon(CubeOutline) })
}
```

- Menu `key` must match route `name` for active highlighting
- Gate with the **read** permission (`*.read`)
- Do not hardcode role names like `'Admin'` — use permission strings from `/auth/me`

---

### Step 7 — View page scaffold

**Purpose:** Create the page component with consistent layout.

**Products reference:** `src/views/products/ProductList.vue`

**Standard list page structure:**

```text
page-header
  ├── n-h2 (title)
  └── n-button "+ New" (v-if hasPermission('module.create'))

filters (search, selects)
n-data-table (remote pagination)
n-modal (create/edit form)
```

**Conventions:**

- `<script setup lang="ts">` — Composition API only
- `page-header` class for title + primary action row
- Primary "create" button **outside** the grid (full labeled button is OK here)
- Lazy-loaded via router `import()` — do not eagerly import in `router/index.ts`

**Choose template by feature type:**

| Pattern | Copy from |
|---------|-----------|
| CRUD list + modal | `ProductList.vue` |
| List + separate detail page | `OrderList.vue` + `OrderDetail.vue` |
| Admin tabbed area | `AdminDashboard.vue` + `UserManagement.vue` |

---

### Step 8 — List data: load, paginate, filter

**Purpose:** Remote data table backed by paginated API.

**Products reference:** `loadData()`, `pagination`, `handlePageChange` in `ProductList.vue`

**State:**

```typescript
const loading = ref(false)
const items = ref<ProductListItem[]>([])
const page = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const search = ref('')
```

**Load function:**

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
    items.value = res.data.items
    totalCount.value = res.data.totalCount
  } finally {
    loading.value = false
  }
}
```

**Table setup:**

```html
<n-data-table
  :columns="columns"
  :data="products"
  :loading="loading"
  :pagination="pagination"
  remote
  @update:page="handlePageChange"
/>
```

**Search:** use `debounce()` from `src/utils/debounce.ts` on search input (300ms default).

**Filters:** reset `page` to `1` on filter change, then `loadData()`.

---

### Step 9 — Forms and modals (create & update)

**Purpose:** Collect user input and call create/update API.

**Products reference:** `form`, `rules`, `openCreate`, `openEdit`, `handleSubmit` in `ProductList.vue`

**Pattern:**

1. `reactive` form model aligned with `Create*Request` / `Update*Request`
2. `FormRules` for client-side UX validation (required fields, types)
3. `n-modal` with `preset="dialog"` — single modal for create and edit (`editing` ref)
4. On submit: `await formRef.value?.validate()` then `productApi.create()` or `productApi.update()`
5. On success: `message.success`, close modal, `loadData()`
6. On failure: `message.error(getApiError(e))`, return `false` from modal handler to keep open

**Create vs update payload:**

- Create: send `CreateProductRequest` fields only
- Update: send full `UpdateProductRequest` including `isActive` when editing

**Rule:** Client validation is for UX; server ProblemDetails is authoritative for 400 errors.

**Date fields:** use `AppDatePicker` (`src/components/AppDatePicker.vue`). Persian UI selects and shows Jalali dates; English UI uses the Gregorian calendar. Bind ISO `yyyy-MM-dd` (Gregorian) to the API. Do not use `n-date-picker` — Naive `dateFaIR` is not a Jalali calendar.

---

### Step 10 — Permissions (UI gates)

**Purpose:** Hide/disable actions the user cannot perform. Backend still enforces — this is UX only.

**Products reference:** `usePermission()` throughout `ProductList.vue`

| UI element | Permission | Pattern |
|------------|------------|---------|
| Route access | `products.read` | `meta.permission` in router |
| Menu item | `products.read` | `hasPermission` in `AppLayout.vue` |
| Sync button | `products.update` | `v-if="hasPermission('products.update')"` → `productApi.sync()` |
| Edit action | `products.update` | `hasPermission` in column render |
| Status switch | `products.update` | `renderGridStatusSwitch` with API call or disabled read-only |

**Composable:**

```typescript
import { usePermission } from '../../composables/usePermission'
const { hasPermission } = usePermission()
```

**Never** check role names in views — use permission strings from backend.

---

### Step 11 — Data grid conventions

**Purpose:** Consistent table UX across modules.

**Products reference:** `src/utils/gridActions.ts`

#### Row actions column

- **Icon only** + hover tooltip — use `renderGridAction()`
- **No labeled text buttons** inside the grid

```typescript
renderGridAction(CreateOutline, t('common.edit'), () => openEdit(row), 'primary')
renderGridAction(TrashOutline, t('common.delete'), () => openDeleteConfirm(row), 'error')
```

#### Delete confirmation

- Trash icon **must not** call the delete API directly
- Open a confirm modal; run delete only after user confirms
- Cancel closes the modal with no API call

#### Status column

- **`NSwitch` toggle only** — use `renderGridStatusSwitch()` + `gridStatusColumnProps`
- **No plain status text** in grid cells
- On toggle: call `productApi.update` with full row payload + new `isActive`
- If user lacks `products.update`: render switch as **disabled** (read-only)

#### Other columns

- Use `formatDateTime()` from `useDateFormat` for timestamps
- Display server-provided text fields (`productTypeText`) rather than re-deriving labels when API provides them

---

### Step 12 — Error handling, feedback, and verification

**Purpose:** Clear user feedback; graceful API failure handling.

**Utilities:**

| Utility | Path | Use |
|---------|------|-----|
| `getApiError(e)` | `src/utils/error.ts` | User-facing message from Axios error |
| `translateApiErrorMessage()` | `src/utils/api-error-translator.ts` | Persian/English mapping for known backend messages |
| `useMessage()` | Naive UI | Success/error toasts |

**Patterns:**

```typescript
try {
  await productApi.create(payload)
  message.success(t('common.success'))
} catch (e) {
  message.error(getApiError(e) || t('common.error'))
}
```

**HTTP handling (global — `client.ts`):**

- **401** → refresh token queue → retry or logout → login
- **403** → show error; do not retry
- **400** → show validation message from ProblemDetails
- **409** → show conflict message (e.g. duplicate code)

**Verification:**

```bash
cd frontend
npm run build
npm run dev
```

Manual test matrix:

- [ ] Admin: full CRUD
- [ ] Manager/Sales/User: verify 403 or hidden buttons per permission matrix
- [ ] Persian (`fa`) + RTL layout
- [ ] Search, filters, pagination
- [ ] Create validation errors
- [ ] Network tab matches Swagger contract

---

## 4. New module file checklist

When scaffolding `{Module}` (e.g. `Widgets`):

### Types

```text
src/types/{module}.ts          ListItem, Detail, CreateRequest, UpdateRequest, ListQuery
```

### API

```text
src/api/{module}.ts            {module}Api object with getAll, getById, create, update, delete
```

### View

```text
src/views/{module}/{Module}List.vue     (or List + Detail pages)
```

### Router & layout

```text
src/router/index.ts            route + meta.permission + keepAlive
src/components/layout/AppLayout.vue   menu item gated by *.read
```

### i18n

```text
src/i18n/en.ts                 {module}.* and nav.{module} keys
src/i18n/fa.ts                 same keys in Persian
```

### Optional

```text
src/utils/api-error-translator.ts   add mappings for new backend error messages
frontend/context/05-api-integration.md   document new endpoints
```

### Cross-cutting (if new backend permissions)

Coordinate with backend:

```text
backend PermissionIdentifiers + seed
frontend permission strings must match exactly
```

---

## 5. User action flow reference

### List products (page load)

```text
User navigates to /products
  → router.beforeEach (auth + products.read)
  → ProductList.vue onMounted → loadData()
  → productApi.getAll({ page, pageSize, ... })
  → client.ts (Bearer + Accept-Language)
  → GET /api/v1/products
  → items rendered in n-data-table
```

### Sync products from Weighbridge

```text
User clicks Sync (products.update)
  → productApi.sync()
  → POST /api/v1/products/sync
  → 200 → message.success → loadData()
  → 409 → sync already in progress (translated toast)
```

### Update product (modal or status switch)

```text
User clicks edit (products.update) OR toggles status switch
  → productApi.update(id, fullPayload)
  → PUT /api/v1/products/{id}
  → 200 → message.success → loadData()
```

---

## 6. Rules of thumb

| Topic | Rule |
|-------|------|
| API contract | Swagger / backend DTOs are source of truth |
| HTTP | Views → `api/{module}.ts` → `client.ts` only |
| Business logic | Backend only — no duplicate invariants in SPA |
| Permissions | Backend strings verbatim; gate routes, menus, actions |
| Roles | Never hardcode `'Admin'` in views — use `hasPermission` |
| Grids | Icon actions + tooltips; status = `NSwitch` only |
| Delete | Confirm modal required — never delete on trash-icon click alone |
| Date pickers | `AppDatePicker` only — Jalali when `fa`, Gregorian when `en`; API ISO `yyyy-MM-dd` |
| i18n | Both `en.ts` and `fa.ts`; default locale `fa` |
| RTL | `dir` on table wrapper when `locale === 'fa'` |
| Errors | `getApiError()` + optional `translateApiErrorMessage()` |
| Search | `debounce()` on text inputs |
| Lists | Remote pagination; reset page on filter change |
| State | Fetch from API; avoid duplicating server state in Pinia |
| New module | Copy **ProductList.vue** pattern — do not invent new architecture |
| Full-stack | Backend workflow first, then this frontend workflow |

---

## 7. Completion checklist

Before marking a frontend module done:

```bash
cd frontend
npm run build
```

- [ ] Types match Swagger / backend DTOs
- [ ] All API operations in `src/api/{module}.ts`
- [ ] Route registered with correct `meta.permission`
- [ ] Menu item gated by `*.read`
- [ ] Create/update/delete buttons gated by permissions
- [ ] Grid uses `renderGridAction` and `renderGridStatusSwitch`
- [ ] Delete actions use a confirm modal (no direct delete on icon click)
- [ ] Date fields use `AppDatePicker` (Jalali in `fa`, Gregorian in `en`)
- [ ] i18n keys in both `en.ts` and `fa.ts`
- [ ] RTL table wrapper for Persian
- [ ] Error messages via `getApiError()`
- [ ] `context/05-api-integration.md` updated if endpoints are new
- [ ] Manual test with Admin + at least one restricted role
- [ ] For financial features, follow `docs/financial-control-e2e-verification.md` journeys
- [ ] Re-index `C-sarayi-sale-frontend` if structure changed

---

## Quick reference — Products module files

| Concern | Path |
|---------|------|
| Types | `src/types/product.ts` |
| API | `src/api/products.ts` |
| List + CRUD view | `src/views/products/ProductList.vue` |
| Route | `src/router/index.ts` (`Products` route) |
| Menu | `src/components/layout/AppLayout.vue` |
| Permissions | `src/composables/usePermission.ts` |
| Axios client | `src/api/client.ts` |
| Grid helpers | `src/utils/gridActions.ts` |
| Errors | `src/utils/error.ts`, `src/utils/api-error-translator.ts` |
| i18n | `src/i18n/en.ts`, `src/i18n/fa.ts` |
| API docs | `context/05-api-integration.md` |

For deeper walkthroughs and layer-by-layer detail, see [`developer-guide.md`](./developer-guide.md).
