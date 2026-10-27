# API Integration (ManualSSO)

See [docs/ENDPOINT_INVENTORY.md](../docs/ENDPOINT_INVENTORY.md) for the full REST map.

## Client

- Axios `src/api/client.ts`
- `baseURL`: `VITE_API_URL` (default `/api`)
- Vite rewrites `/api` → backend root (`APP_PORT`, default `4556`)
- Auth header: `Authorization: Bearer <access_token>`
- Errors: Nest `{ status, error }` via `getApiError()`

## Modules

| File | Backend |
|------|---------|
| `api/admins.ts` | `/admins/*` |
| `api/users.ts` | `/users/*` (REST only; no gRPC) |
| `api/apps.ts` | `/apps/*` |
| `api/medias.ts` | `/medias/*` |
