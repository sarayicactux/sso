---
name: sale-frontend
description: Development guide for the sale Vue.js SPA — pages, components, routes, API integration, auth, permissions, and UI conventions. Use when working in frontend/, editing Vue components, composables, stores, router, API clients, forms, or any frontend development task. Triggers on Vue.js, Vue Router, Pinia, Vite, SPA, RTL UI, frontend permissions.
---

# sale Frontend (Vue.js)

## Scope

This skill applies only to **`frontend/`** — the Vue.js SPA.

Do **not** use .NET backend coding rules for frontend implementation. Call the backend REST API over HTTP.

## Current status (2026-08-30)

- **Backend API:** Implemented (Phases 1–7)
- **Frontend SPA:** Implemented — Vue 3 + Vite + TypeScript + Pinia + Naive UI + vue-i18n + Axios
- **Modules:** Login/auth, dashboard, products, orders, admin (users + roles tabs)
- **Next:** Polish, E2E tests

## Codebase memory (required)

Before exploring or editing frontend code:

1. Use MCP project **`C-sarayi-sale-frontend`**
2. Follow skill **`codebase-memory-first`**
3. Index path: `frontend/`

Re-index after structural changes.

## Authoritative sources (load these)

1. **Memory:** `frontend/MEMORY.md`
2. **Module workflow (canonical):** `docs/module-development-workflow.md` · `.cursor/rules/feature-development-frontend.mdc`
3. **Knowledge digest:** `frontend/context/` (see `README.md` index)
4. **Backend API contract:** `context/05-api-integration.md`
5. **Backend OpenAPI:** `http://localhost:5064/swagger` (when running locally)

| Task | Read |
|------|------|
| Any change | `MEMORY.md`, `00-project-overview.md` |
| **New feature / module** | **`docs/module-development-workflow.md`**, `feature-development-frontend.mdc`, `04-coding-rules.md` |
| API calls / errors | `05-api-integration.md` |
| Auth / permissions | `06-auth-and-permissions.md` |
| Structure / routing | `01-architecture.md`, `03-folder-structure.md` |
| Grid / table UI | `04-coding-rules.md` |

## Solution layout

```text
frontend/src/
  api/           # Axios modules (auth, users, roles, products, orders) + client.ts
  components/    # AppLayout (sidebar, menu, change-password modal)
  composables/   # usePermission, useDateFormat
  i18n/          # fa.ts, en.ts (Persian default, RTL)
  router/        # Routes + auth/permission guards
  stores/        # auth.ts (JWT + refresh), theme.ts
  types/         # DTOs per backend module
  utils/         # error, gridActions, debounce, api-error-translator, persianDigits
  views/         # auth, dashboard, products, orders, admin, not-found
```

## Key patterns (follow these)

**All new features must follow `docs/module-development-workflow.md`** — same 12-step process and conventions as the Products module.

### API client

- Base URL: `/api/v1` (Vite dev proxy → `http://localhost:5064`)
- `src/api/client.ts` — Axios instance, Bearer attachment, 401 refresh queue
- One module per backend area: `auth.ts`, `users.ts`, `roles.ts`, `products.ts`, `orders.ts`

### Auth store

- `src/stores/auth.ts` — login, logout, refresh, `/me`, token timers, localStorage persistence
- Route guard: `requiresAuth` meta; permission guard: `meta.permission`

### Permissions

- Flat string list from `GET /api/v1/auth/me`
- `usePermission()` composable — `hasPermission`, `hasAnyPermission`, `hasAllPermissions`
- UI gates only; backend enforces via `[Permission(...)]`

### Data grids

- **Row actions:** icon + hover tooltip — `renderGridAction()` from `src/utils/gridActions.ts`
- **Status column:** `NSwitch` toggle — `renderGridStatusSwitch()` + `gridStatusColumnProps`
- No labeled text buttons in grid action columns; no status text in grid cells

### Errors

- `getApiError()` in `src/utils/error.ts` — ProblemDetails parsing
- `translateApiErrorMessage()` in `src/utils/api-error-translator.ts` — i18n for backend messages

### Modals

- Use `n-modal`; global defaults in `src/main.ts` disable backdrop click and Esc
- Close only via Cancel (negative/footer button) or close icon — never click-outside

### Delete confirmation (required)

- **Never delete on trash-icon click alone** — applies to grids, tables, nested lists, and any destructive row/card action
- Clicking delete opens a **confirm modal** (`n-modal` dialog preset or equivalent); the delete API runs **only** after the user confirms
- Cancel / close icon dismisses the modal with **no** API call
- Wire grid actions as `() => openDeleteConfirm(row)` — not `() => handleDelete(row.id)` directly
- Reuse `DeleteConfirmModal` + `useDeleteConfirm()` — modal owns its own state via `defineExpose`
- Usage: `const { modalRef: deleteConfirmRef, openDeleteConfirm } = useDeleteConfirm()` + `<DeleteConfirmModal ref="deleteConfirmRef" />`
- Use i18n for title, message, and buttons (`common.delete`, `common.confirm`, `common.cancel`, module-specific message keys)

### i18n / RTL

- Default locale: Persian (`fa`); English available
- `toPersianDigits()` global + `useDateFormat` for Jalali/Gregorian **display** of stored dates
- **Date pickers:** `AppDatePicker` only — Jalali calendar when `fa`, Gregorian when `en`. Never use `n-date-picker` directly (`dateFaIR` is still Gregorian). `v-model` is ISO `yyyy-MM-dd`

## Routes

| Path | View | Permission |
|------|------|------------|
| `/login` | LoginView | public |
| `/` | DashboardView | auth |
| `/products` | ProductList | `products.read` |
| `/orders` | OrderList | `orders.read` |
| `/orders/:id` | OrderDetail | `orders.read` |
| `/admin` | AdminDashboard (users + roles tabs) | auth + tab-level permissions |

## Run

```bash
# Backend (required)
cd backend && docker compose up -d
dotnet run --project src/Sale.Api --launch-profile http

# Frontend
cd frontend && npm install && npm run dev
# http://localhost:5173
```

Default login: `admin@example.com` / `ChangeMe-Admin123!`

## Adding a new feature (checklist)

Follow **`docs/module-development-workflow.md`** (12 steps). Summary:

```text
[ ] Step 1:    Confirm backend API contract (Swagger)
[ ] Step 2–3:  types/{module}.ts + api/{module}.ts
[ ] Step 4–6:  i18n (en+fa), router, AppLayout menu
[ ] Step 7–9:  View scaffold, list/pagination/filters, create/update modal
[ ] Step 10–11: Permission gates, grid conventions (renderGridAction/Switch), delete confirm modal
[ ] Step 12:   getApiError, npm run build, manual permission matrix test
[ ] Update context/05-api-integration.md if new endpoints
[ ] Re-index C-sarayi-sale-frontend
```

Copy **ProductList.vue** as the primary CRUD template.

## Backend contract (summary)

- Base: `/api/v1/`
- Auth: JWT Bearer + refresh token rotation
- Errors: RFC 9457 ProblemDetails with `errors` for validation
- Permissions: gate UI from `/api/v1/auth/me` permissions array
- Lists: pagination via `page`, `pageSize`, `sortBy`, `search`

Full endpoint list: `context/05-api-integration.md`
