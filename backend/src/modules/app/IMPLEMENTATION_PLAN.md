# AppsModule implementation plan

## Goal

Implement the SSO client `AppsModule` from existing domain contracts (no new architecture). On create, issue a unique random `accessToken` (≥ 40 characters). Expose admin-protected HTTP under `/apps`. Register the module in the root `AppModule`.

## Decisions (confirmed)

| Topic | Choice |
|-------|--------|
| Token | Random secret via `crypto.randomBytes(32).toString('hex')` (64 chars), unique |
| Auth | All routes `@Admin()` including `findByAccessToken` |
| Paths | `POST /apps`, `PUT /apps/:id`, `PATCH /apps/:id/status`, `PATCH /apps/:id/activeSession`, `GET /apps`, `GET /apps/by-token/:accessToken`, `GET /apps/:id` |
| Create | `adminId` from authenticated admin; `status`/`activeSession` default `true` |
| Errors | English `{ status, error }` messages |
| Token in response | On create and find (mapper uses stored `accessToken`) |
| Prisma | User fixed `app.prisma` / merged schema; sync Admin/Media reverse `apps` in source fragments |

## Phase 1 — Persistence contracts

**Objective:** Repository implements `AppRepositoryImpl`; Prisma fragments stay combinable.

**Files:**
- `infrastructure/repositories/app.repository.ts` (replace admin copy)
- `infrastructure/models/app.prisma` (already fixed)
- `admin` / `media` `*.prisma` reverse `apps App[]` if missing

**Steps:**
1. Implement `create`, `update`, `updateStatus`, `updateActiveSession`, `findById`, `findByAccessToken`, `findAll`.
2. Use `findOne` / `findAll` helpers (avoid `findByUnique` + `deletedAt` bug).
3. Include `Media` on reads where useful for `AppDto`.

**Validation:** Typecheck; repository methods match domain interface.

**Done when:** Repository compiles and is injectable.

## Phase 2 — CQRS commands & queries

**Objective:** Handlers call repository only (Media/Admin style).

**Files under `application/`:**
- Commands: `create`, `update`, `updateStatus`, `updateActiveSession`
- Queries: `findById`, `findByAccessToken`, `findAll`

**Steps:** Thin command/query + handler pairs; register in `AppsModule`.

**Validation:** Handlers registered; execute path reaches repository.

**Done when:** All `AppRepositoryImpl` methods have bus coverage.

## Phase 3 — Application service + mapper + DTOs

**Objective:** Business rules in `AppService`; HTTP DTOs for update/status/session.

**Files:**
- `application/services/app.service.ts`
- `infrastructure/mappers/app.mapper.ts`
- `presentation/dtos/app.dto.ts`
- Domain controller interface: align `update` return with service (`boolean`)

**Steps:**
1. On create: generate token; set `adminId`, `status`, `activeSession`; dispatch create command; map DTO with `accessToken`.
2. Updates: load by id → not found English error → command → optional audit via `Tools.saveLogs`.
3. Finds: query → map with `accessToken` from entity.
4. Unique constraint failures → English conflict error.

**Validation:** Service implements `AppServiceImpl`.

**Done when:** Service returns DTOs with `accessToken` on create/find.

## Phase 4 — Controller + module wiring

**Objective:** Live HTTP under `/apps`; root import.

**Files:**
- `presentation/controllers/app.controller.ts`
- `app.module.ts`
- `src/app.module.ts`

**Steps:**
1. Implement all routes with Swagger + `@Admin({ operationId })`.
2. Wire providers (repo, handlers, service, mapper, Jwt, Tools).
3. Import `AppsModule` in root.

**Validation:** Nest build; routes resolve.

**Done when:** Module boots with `AppsModule` registered.

## Phase 5 — Verify & document

**Objective:** Build verified; plan updated; MCP re-index. No test files (project policy).

**Steps:** `npm run build`; update this plan; re-index codebase-memory.

---

## Phase 6 — Regenerate accessToken

**Objective:** `PATCH /apps/:id/accessToken` regenerates a unique token and persists it. Input is only `id`.

**Domain:** `UpdateAccessTokenInterface`, repository/service/controller contracts updated.

**Application:** `UpdateAppAccessTokenCommand` + handler; `AppService.regenerateAccessToken`.

**Done when:** Build passes; endpoint returns `AppDto` including the new `accessToken`.

## Final state (update after implementation)

Implemented and verified:

- `AppRepository`, CQRS commands/queries, `AppService`, `AppController`, `AppsModule`
- Root `AppModule` imports `AppsModule`
- Create issues unique `accessToken` via `generateAppAccessToken()` (`randomBytes(32).toString('hex')`, ≥ 40 chars)
- Routes under `/apps` all `@Admin()`; English errors; `accessToken` on create and find responses
- `npm run build` passed
- No test files (project policy: do not create tests unless explicitly requested)
- `PATCH /apps/:id/accessToken` regenerates and persists a unique `accessToken`; returns `AppDto`
