# Auth and Permissions

## Authentication (backend implemented)

- Login: `POST /api/v1/auth/login` → `{ accessToken, refreshToken, expiresInSeconds, refreshExpiresInSeconds }`
- Current user: `GET /api/v1/auth/me` → profile with `roleId` and `permissions[]`
- Refresh: `POST /api/v1/auth/refresh` → `{ refreshToken }` body → new token pair
- Logout: `POST /api/v1/auth/logout` → revoke token server-side

Store tokens in Pinia auth store + `localStorage` (`frontend/src/stores/auth.ts`).

## Authorization model

Backend RBAC with permission strings on `PermissionIdentifiers`:

```text
users.read | users.create | users.update | users.delete
products.read | products.update
orders.read | orders.create | orders.update | orders.cancel | orders.change_status | orders.release | orders.load
orders.cottages.read | orders.cottages.manage
roles.read | roles.create | roles.update
customers.read | customers.create | customers.update | customers.delete
customers.view_financial | customers.manage_addresses | …
payments.read | payments.create | payments.update | payments.confirm | payments.cancel
payments.allocate | payments.manage_schedule | payments.manage_cheques
payments.manage_credit | payments.approve_credit | payments.approve_manual | payments.reports
payment_terms.read | payment_terms.create | payment_terms.update
countries.read | countries.create | countries.update | countries.delete
terminals.read | terminals.create | terminals.update | terminals.delete
```

Backend enforces via `[Permission(...)]` — frontend gates are UX only.

## Seed roles (for testing)

| Role | Typical permissions |
|------|---------------------|
| Admin | All |
| Manager | users/products/orders/customers + all `payments.*` + `payment_terms.*` + geography admin |
| Sales | products/orders/customers; `payments.read`, `payments.create`, `payments.manage_schedule` (no confirm / approve_credit / approve_manual / reports / payment_terms admin) |
| User | orders.read (own orders only) |

Dev credentials in `05-api-integration.md`.

## Frontend responsibilities

- **Route guards**: block unauthenticated users from protected routes
- **UI gates**: hide/disable actions when permission missing
- **401 interceptor**: clear tokens, refresh token, user info, and permissions, then redirect to `/login`
- **403 handling**: show forbidden message — do not retry
- Never rely on UI-only hiding for security

## Permission check pattern

```typescript
// frontend/src/composables/usePermission.ts
function hasPermission(code: string): boolean {
  return authStore.permissions.includes(code)
}
```

## Token lifecycle

```text
Login → store accessToken + refreshToken (+ call /auth/me)
Request → attach Bearer accessToken (src/api/client.ts interceptor)
401 → clear session (token, refreshToken, userInfo, permissions) → redirect `/login`
Logout → POST /auth/logout → clear store
```

## Frontend file map

| Concern | Path |
|---------|------|
| Auth store | `src/stores/auth.ts` |
| Axios client + 401 session wipe | `src/api/client.ts` |
| Permission composable | `src/composables/usePermission.ts` |
| Route guards | `src/router/index.ts` (`requiresAuth`, `meta.permission`) |
| Login page | `src/views/auth/LoginView.vue` |
| Menu permission gates | `src/components/layout/AppLayout.vue` |

Access tokens are DB-backed — logout invalidates immediately.

## Local dev note

Run backend with `--launch-profile http` on port 5064. HTTPS redirection is disabled in Development so the Vite proxy works without stripping Bearer tokens on redirect.
