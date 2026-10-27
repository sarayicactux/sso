# 01 — Architecture

## How to Use This Document

Use this when adding a module, tracing a request, or deciding which layer owns a change. Layer rules for commands and queries are in [07-cqrs-rules.md](07-cqrs-rules.md). Persistence rules are in [09-query-dataAccess-rules.md](09-query-dataAccess-rules.md).

## Style

**Verified:** NestJS modular monolith. Each feature under `backend/src/modules/<feature>/` is split into:

```
presentation  → HTTP, DTOs, Swagger
application   → services, commands, queries, handlers, CQRS events
domain        → entities, repository/service/controller interfaces, input interfaces
infrastructure → Prisma model fragment, repositories, mappers
```

Controllers do not call Prisma. Application services do not call Prisma. Handlers call infrastructure repositories. Repositories call `PrismaService`.

```
Controller → Application service → CommandBus | QueryBus | EventBus
  → Handler → Infrastructure repository → PrismaService → PostgreSQL
```

The `@Admin()` parameter decorator is the exception: it constructs its own `PrismaService` and reads `admin` / `adminToken` directly. New protected routes keep using `@Admin()` until a guard is an explicit decision.

## Composition root

`backend/src/app.module.ts`:

| Import | Purpose |
|--------|---------|
| `ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' })` | Env |
| `PrismaModule` | Exports `PrismaService` |
| `AdminModule` | Admin HTTP + CQRS handlers |
| `MediaModule` | Media HTTP + CQRS handlers |
| `EventsModule` | Global `EventEmitterModule` |
| `SeedAdminCommand` | CLI provider, not an HTTP route |
| `LoggingMiddleware` | Applied to `*` |

`CqrsModule` is imported inside `AdminModule` and `MediaModule`, not in the root module.

## Process bootstrap (`main.ts`)

**Verified behavior:**

- CORS enabled twice (`NestFactory.create({ cors: true })` and `enableCors` with credentials).
- Global `ValidationPipe` with default options (no `whitelist`, no `transform`).
- `express-session` cookie name `exirbuy.ts`. Secret is hardcoded. Do not copy it. Do not build new features on this session; auth is JWT + `admin_tokens`.
- Cookie parser, JSON and urlencoded body limit `50mb`.
- Helmet after custom CORS headers.
- EJS view engine and static assets from `pathes.ts` (`../public`, views `./views`).
- Swagger document is always built. UI is mounted at `/api` only when `NODE_ENV` is `test`.
- `(global as any).allRoutes = inRoleRoutes(document.paths)` stores operations whose Swagger description is exactly `this operation protected by RBAC`. Current controllers do not use that sentence, so the list stays empty.
- `NotFoundFilter` is commented out.

There is no global route prefix and no URI versioning.

## Feature module recipe (copy admin or media)

`AdminModule` / `MediaModule` register, in one `@Module`:

1. `imports: [CqrsModule]`
2. `controllers`: presentation controllers
3. `providers`: application service, infrastructure repositories, command handlers, query handlers, event handlers, mapper, `Jwt`, `Tools`, and a local `PrismaService`
4. `exports`: repository and application service when another module must call them

**Established:** each feature lists `PrismaService` in its own `providers` and does not import `PrismaModule`. That constructs a separate Prisma client per module, plus the root `PrismaModule` client, plus clients created with `new PrismaService()` inside `@Admin()` and `@User()`. New code should inject the existing exported client once a module imports `PrismaModule`. Do not add another `new PrismaService()`.

## CQRS inside a use case

Example login (`AdminService.login`):

1. `queryBus.execute(new GetAdminByMobileQuery(mobile))`
2. `bcrypt.compare` in the service (hashing stays out of the repository)
3. `jwt.signer` in the service
4. `commandBus.execute(new CreateAdminTokenCommand(...))`
5. `AdminMapper.toAdminDto` in the service

Handlers are thin: `CreateAdminHandler.execute` calls `AdminRepository.create`.

## Events

Two event mechanisms exist:

| Mechanism | Used for | Where |
|-----------|----------|-------|
| `@nestjs/cqrs` `EventBus` | Audit rows | `Tools.saveLogs` publishes `CreateLogEvent`. `CreateLogHandler` writes `LogRepository` |
| `@nestjs/event-emitter` | Registered globally | `EventsModule`. No listeners in `src/` |

New audit logs go through `Tools.saveLogs`, which requires an injected `Tools` (it needs `EventBus`). Do not `new Tools()`.

## Auth architecture

`@Admin()` (`backend/src/shared/decorators/admin.decorator.ts`):

1. Requires `Authorization` header.
2. Strips the `Bearer ` prefix.
3. Loads `adminToken` by `access_token` (`findOne`, which also forces `deletedAt: null`).
4. Verifies JWT with `process.env.secretKey`.
5. Loads `admin` by id from the token payload.
6. Returns `AdminDto` including the access token.
7. Accepts `{ operationId }` and does not authorize against it.

`@User()` (`backend/src/shared/decorators/user.decorator.ts`) mirrors `@Admin()` against `userToken` / `userId` / `UserMapper`.

Public admin routes: `POST /admins/login`, `PUT /admins/forgetPass`, `PATCH /admins/recoverPass`.

Public user routes: `POST /users`, `DELETE /users/apps`, `POST /users/login`, `PUT /users/forgetPass`, `PATCH /users/recoverPass`.

## Cross-cutting

| Concern | Owner |
|---------|--------|
| Request logging | `LoggingMiddleware` (status and timing; skips body) |
| Persian mobile shape | `MobilePipe` on forget-password |
| 4-digit code shape | `CodePipe` on recover-password |
| File name on disk | `editFileName` multer callback |
| MIME classification | `Tools.checkMime` by extension |
| Password hashing | `bcryptjs` in `AdminService` (cost 10) |
| JWT | `shared/helpers/jwt.helper.ts`. Login TTL `86400 * 30` seconds. Recover TTL `60 * 60` seconds |

## What is live vs leftover

| Path | Status |
|------|--------|
| `modules/admin/**` except unused queries | Live. Some queries (`GetAdminQuery`, `AllAdminQuery`, `FindLogQuery`, `GetAdminByEmail`, `GetAdminByUsername`) are registered and have no HTTP caller |
| `modules/media/**` | Upload and delete are live. `UpdateMediaOwnerCommand` is registered and has no caller |
| `modules/app/domain/**`, `app.dto.ts`, `app.mapper.ts`, `app.prisma` | Draft of the SSO app aggregate |
| `modules/app/app.module.ts`, `application/services/app.service.ts`, `infrastructure/repositories/app.repository.ts`, `presentation/controllers/app.controller.ts` | Stale admin copies. Broken imports. Not registered |
| `dist/src/modules/admin - Copy` | Build artifact. Ignore |
| `shared/leakyService.service.ts` | Disabled memory-leak demo |

## Adding a feature

1. Read [04-domain-design.md](04-domain-design.md) and [07-cqrs-rules.md](07-cqrs-rules.md).
2. Add the module under `backend/src/modules/<name>/` using the four folders above.
3. Put the Prisma fragment in `infrastructure/models/<name>.prisma`.
4. Run `npm run build:schema` from `backend/`, then `npx prisma generate`, then `npx prisma db push` when the schema change is intended.
5. Import the Nest module from `backend/src/app.module.ts` only when the HTTP API should go live.
6. Register every new handler in the feature module `providers`. An unregistered handler never runs.
