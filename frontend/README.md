# ManualSSO Frontend

Vue 3 admin/user portal for the ManualSSO NestJS backend. Supports Persian (RTL) and English (LTR).

## Stack

- Vue 3 + Vite + TypeScript
- Vue Router + Pinia
- Naive UI + @vicons
- vue-i18n (`fa` default / `en`)
- Axios with `Authorization: Bearer <access_token>`

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Dev server: `http://localhost:5173`  
Proxies `/api/*` → `http://localhost:4556/*` (override with `VITE_PROXY_TARGET`).

Ensure the backend is running (`APP_PORT=4556` by default) and CORS allows the frontend origin.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc` + production build |
| `npm run preview` | Preview production build |

## Auth flows

| Portal | Login | Dashboard |
|--------|-------|-----------|
| User (default) | `/login` → `POST /users/login` (`username` + `password`) | `/user` |
| Admin | `/login/admin` → `POST /admins/login` (`username` + `password`) | `/admin` |

Password recovery: `/reset-password/admin` and `/reset-password/user` (forget + recover with `recover_pass_token` header).

## Admin features

- **Applications** (`/admin/apps`): list, create/edit modals, status/activeSession toggles, token view/regenerate, optional media upload
- **Users** (`/admin/users`): list from `GET /users`, create/grant, activate/deactivate (`PATCH /users/:id/status`), manage app associations in a modal

See `docs/ENDPOINT_INVENTORY.md`.

## Out of scope

- gRPC `ValidateUserAppAccess` (not exposed to the SPA)

## Locale / direction

Language toggle in the header (and on login). `fa` → `dir=rtl`, `en` → `dir=ltr`, including Naive UI locale.
