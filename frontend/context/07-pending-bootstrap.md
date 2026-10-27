# Bootstrap Complete

## Current state

The Vue.js frontend scaffold is **implemented** in `frontend/` following `warehouse-frontend` patterns.

- Stack: Vue 3 + Vite + TypeScript + Pinia + Naive UI + vue-i18n + Axios
- API base: `VITE_API_URL=/api/v1` (proxied to `http://localhost:5064` in dev)
- Auth: JWT Bearer with refresh queue in `src/api/client.ts` and `src/stores/auth.ts`
- Permissions: flat string list from `GET /api/v1/auth/me`

## Quick start

```bash
# Backend
cd backend
docker compose up -d
dotnet run --project src/Sale.Api --launch-profile http

# Frontend
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

Default login: `admin` / `ChangeMe-Admin123!`

## Key file locations

| Concern | Path |
|---------|------|
| Axios client + 401 refresh | `src/api/client.ts` |
| Auth store | `src/stores/auth.ts` |
| Permission helper | `src/composables/usePermission.ts` |
| Router guards | `src/router/index.ts` |
| Layout + menu | `src/components/layout/AppLayout.vue` |
| API modules | `src/api/*.ts` |
| Types | `src/types/*.ts` |

## MCP

Re-index after structural changes:

```text
index_repository repo_path=frontend/ project=C-sarayi-sale-frontend
```
