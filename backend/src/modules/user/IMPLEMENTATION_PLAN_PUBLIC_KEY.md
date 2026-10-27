# UserModule — generate app publicKey URL

## Goal

Add an authenticated User API that generates a unique `publicKey` on the current session `UserToken`, persists it, and returns `{ publicKey, url }` where `url` is `{app.url}?pk={publicKey}`.

## Confirmed decisions (from code + task)

| Topic | Choice |
|-------|--------|
| Auth | `@User()` — identity from Bearer token only |
| Input | `appId` path param (`POST /users/apps/:appId/publicKey`) |
| Token row | Update latest `UserToken` for authenticated `userId`; do not use/check `access_token`; do not create a new token |
| Key generator | Reuse `generateAppAccessToken()` (`randomBytes(32).toString('hex')`, ≥40 chars) |
| Uniqueness | `publicKey String? @unique`; retry up to 5 times via `findByPublicKey` |
| Existing rows | Nullable column so current `user_tokens` remain valid |
| App access | App must exist; `UserApp` link required; reject inactive user; reject inactive/deleted app |
| Response | New DTO with `publicKey` + `url` only (no JWT / secrets) |
| Errors | English `{ status, error }` |
| Tests | None (project policy) |

## Phase 1 — Persistence

**Objective:** Add nullable unique `publicKey` to `UserToken`.

**Files:**
- `infrastructure/models/userToken.prisma`
- `domain/entities/userToken.entity.ts`
- `context/06-database-models.md`
- `npm run build:schema` → `prisma generate` → `prisma db push`

**Steps:** Add `publicKey String? @unique`. Rebuild schema and apply.

**Validation:** Generated Prisma client includes `publicKey`; existing rows unchanged.

**Done when:** Schema merged and DB updated.

## Phase 2 — Domain + repository + CQRS

**Objective:** Update publicKey on a token; lookup by publicKey for collision checks.

**Files:**
- `domain/interfaces/user_token/UpdateUserTokenPublicKey.interface.ts`
- `domain/interfaces/user/GenerateAppPublicKey.interface.ts` (result shape)
- `domain/repositories/userToken.repository.ts` + infrastructure impl
- Commands: `user_token/updatePublicKey/*`
- Queries: `user_token/findByPublicKey.*`
- Wire providers in `user.module.ts`

**Validation:** Handlers reach repository; types compile.

**Done when:** Bus can update and find by `publicKey`.

## Phase 3 — Service + controller + DTOs

**Objective:** End-to-end authenticated endpoint.

**Files:**
- `presentation/dtos/user.dto.ts` (`AppPublicKeyDto`)
- `application/services/user.service.ts`
- `domain/services/user.service.ts`, `domain/controllers/user.controller.interface.ts`
- `presentation/controllers/user.controller.ts`
- `context/10-api-design.md`

**Steps:**
1. Validate authenticated user (`canAuthenticate`).
2. Load app by id; reject missing/inactive.
3. Require `UserApp` link.
4. Load current `UserToken` by `access_token`.
5. Generate unique key; update token; return `{ publicKey, url }`.

**Validation:** `npm run build`; Swagger docs on the route.

**Done when:** Endpoint returns key + URL without exposing token secrets.

## Final state

Implemented and verified:

- `UserToken.publicKey String? @unique` in `userToken.prisma` / merged schema
- Additive SQL applied via `prisma/add_user_token_public_key.sql` (`prisma db execute`) — existing rows stay valid (NULL)
- Domain/repo/CQRS: `UpdateUserTokenPublicKey*`, `FindUserTokenByPublicKey*`
- `POST /users/apps/:appId/publicKey` with `@User()`; returns `AppPublicKeyDto` `{ publicKey, url }`
- Key via `generateAppAccessToken()` with collision retries; updates current session token only
- Context: `06-database-models.md`, `10-api-design.md`
- No test files (project policy)
