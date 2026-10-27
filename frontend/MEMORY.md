# ManualSSO Frontend — Agent Memory

Last updated: 2026-10-26

## What this folder is

Vue 3 SPA for ManualSSO NestJS backend (`../backend`). Dual portals: admin + end user. FA/RTL + EN/LTR.

## Contract

- Inventory: `docs/ENDPOINT_INVENTORY.md`
- Do **not** call gRPC from the SPA
- No `GET /users` — users table is browser-tracked create/track rows for revoke UX

## Auth

- Admin: `POST /admins/login` → `/admin`
- User: `POST /users/login` → `/user`
- Bearer JWT in `localStorage.accessToken` + `authRole`

## Run

```bash
cd frontend && cp .env.example .env && npm install && npm run dev
```

Backend default `APP_PORT=4556`; proxy target overridable via `VITE_PROXY_TARGET`.
