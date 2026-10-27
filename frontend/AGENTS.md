# Frontend (sale SPA) — Agent Instructions

Vue 3 + Vite + TypeScript + Pinia + Naive UI + vue-i18n + Axios.
Memory: `MEMORY.md` · knowledge: `context/` · module workflow: `docs/module-development-workflow.md` (12 steps, **`ProductList.vue`** = template).
The .NET backend (`../backend/`) is the source of truth for shapes, permissions, and business rules.

## Architecture

```text
View → api/{module}.ts → client.ts (Axios) → /api/v1/* → .NET API
```

- Views call `api/*` modules only — never Axios/fetch directly in views.
- Types mirror backend DTOs (`src/types/{module}.ts`); Swagger is the contract.
- Business rules stay on the backend — no duplicate invariants, totals, duplicate checks, or auth decisions in the SPA.
- JWT Bearer auth: login → store `accessToken` + `refreshToken` → attach to requests. Handle 401 (refresh queue → retry or re-login), 403 (forbidden UI), 400 (ProblemDetails field errors), 409 (conflict).

## Non-negotiables

1. **Bilingual UI** — every user-facing string via vue-i18n in **both** `src/i18n/en.ts` and `src/i18n/fa.ts`; never hardcode labels in templates or scripts. Map backend enum values and error codes to locale keys; enum identifiers stay English.
2. **Grid row actions** — icon + hover tooltip only: `renderGridAction()` from `src/utils/gridActions.ts`. No labeled text buttons in action columns.
3. **Grid status column** — `NSwitch` toggle only: `renderGridStatusSwitch()` + `gridStatusColumnProps`.
4. **Delete confirmation** — trash/delete icons must open a confirm modal (see `src/components/DeleteConfirmModal.vue`, `useDeleteConfirm()`); call the delete API only after the user confirms. Cancel closes with no API call.
5. **Modals** — close only via Cancel or the close icon; never backdrop click or Esc (global default in `src/main.ts` — do not override to `true`).
6. **Date pickers** — `AppDatePicker` (`src/components/AppDatePicker.vue`) only: `fa` → Jalali calendar, `en` → Gregorian. Never use Naive `n-date-picker` for selection. API values stay ISO `yyyy-MM-dd`.
7. **Permissions** — gate routes (`meta.permission`), nav menus, and actions with `usePermission()` using exact backend strings (`products.read`, `orders.release`, ...). Never hardcode role names like `'Admin'`.
8. **Errors** — `getApiError()` from `src/utils/error.ts` + `translateApiErrorMessage()` from `src/utils/api-error-translator.ts`; add keys to both locale files for new backend messages.
9. **RTL** — `dir="rtl"` on table wrappers when `locale === 'fa'`.
10. **Search & lists** — `debounce()` from `src/utils/debounce.ts` on text inputs; remote pagination; reset page to 1 on filter change; `keepAlive` on list routes.

## New module workflow

Follow `docs/module-development-workflow.md` end-to-end (12 steps). **`src/views/products/ProductList.vue`** is the template for CRUD lists; Orders for list + detail pages; AdminDashboard for tabbed admin. Slice order: backend API contract → types → `api/{module}.ts` → i18n keys (en + fa) → router route (`meta.permission` + keepAlive) → nav menu (gated by `*.read` in `AppLayout.vue`) → view scaffold → list (loadData, pagination, filters) → forms/modals (FormRules + api calls) → permission gates → grid conventions → error handling + build.

## Key files

| Concern | Location |
|---------|----------|
| Axios client | `src/api/client.ts` |
| Auth store | `src/stores/` |
| Permissions | `src/composables/usePermission.ts` |
| Grid helpers | `src/utils/gridActions.ts` |
| Delete confirm | `src/components/DeleteConfirmModal.vue`, `src/composables/useDeleteConfirm.ts` |
| Errors | `src/utils/error.ts`, `src/utils/api-error-translator.ts` |
| i18n | `src/i18n/en.ts`, `src/i18n/fa.ts` |
| Date picker | `src/components/AppDatePicker.vue` |
| Routes | `src/router/index.ts` |
| Layout / menu | `src/components/layout/AppLayout.vue` |

## Build & test

```bash
cd frontend
npm run dev          # http://localhost:5173 (proxies /api → localhost:5064)
npm run build        # tsc && vite build
npm run test:e2e     # Playwright (set E2E_API_READY=1 for API-backed tests)
```

Default login: `admin` / `ChangeMe-Admin123!` (also seeded: `sales` / `ChangeMe-Sales123!`, `user` / `ChangeMe-User123!`).