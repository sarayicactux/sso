# Architecture

## SPA pattern

```text
Browser
  -> Vue Router (lazy-loaded views, auth + permission guards)
  -> AppLayout (sidebar menu, breadcrumbs, change-password modal)
  -> Views / components / composables
  -> Pinia stores (auth, theme)
  -> Axios client (src/api/client.ts — Bearer + 401 refresh queue)
  -> .NET REST API (backend/ at /api/v1)
```

## Module map

| Concern | Location |
|---------|----------|
| Routes | `src/router/index.ts` |
| Pages | `src/views/{auth,dashboard,products,orders,admin,not-found}/` |
| Layout | `src/components/layout/AppLayout.vue` |
| API modules | `src/api/{auth,users,roles,products,orders,client}.ts` |
| Auth state | `src/stores/auth.ts` |
| Permissions | `src/composables/usePermission.ts` + route `meta.permission` |
| i18n | `src/i18n/` (Persian default, RTL) |
| Grid helpers | `src/utils/gridActions.ts` |
| Error handling | `src/utils/error.ts`, `src/utils/api-error-translator.ts` |

## Routes

| Path | Component | Guards |
|------|-----------|--------|
| `/login` | LoginView | public |
| `/` | DashboardView | `requiresAuth`, `keepAlive` |
| `/products` | ProductList | `requiresAuth`, `products.read`, `keepAlive` |
| `/orders` | OrderList | `requiresAuth`, `orders.read`, `keepAlive` |
| `/orders/:id` | OrderDetail | `requiresAuth`, `orders.read` |
| `/admin` | AdminDashboard | `requiresAuth`, `keepAlive` — tabs gated by permission |
| `/*` | NotFound | — |

Admin dashboard embeds `UserManagement` and `RoleManagement` as tabs (not separate routes).

## Principles

- UI displays and collects data; business invariants live in the backend
- Auth token attached via centralized Axios interceptor
- Permission-gated routes and actions mirror backend RBAC (UX only — backend enforces)
- Match existing patterns before introducing new layers
- Persian RTL UI with vue-i18n; Jalali dates via `useDateFormat`

## Keep-alive

Dashboard, Products, Orders, and Admin routes use `meta.keepAlive` for tab-style navigation performance.
