---
name: manualsso-engineering
description: >-
  ManualSSO NestJS 12 + Prisma 7 + CQRS engineering guide for the backend SSO
  admin, media, and App aggregates. Use when working in ManualSSO or
  C:\sarayi\ManualSSO for features, debugging, Prisma models, repositories,
  commands, queries, admin auth, media upload, or API changes. Always load
  repo context/ docs before implementing.
---

# ManualSSO Engineering

Canonical knowledge base: `context/` in this repository.

## Mandatory first steps

1. Follow [context/12-engineering-rules.md](../../../context/12-engineering-rules.md) (always-apply Cursor rule in the repo).
2. Use codebase-memory-mcp MCP (`user-codebase-memory-mcp`) when it is connected: `search_graph` / `get_code_snippet` / `get_architecture`. If MCP is required but disconnected, stop and tell the user.
3. Read the relevant context files below before coding.

## Quick reference (verified)

| Item | Value |
|------|-------|
| Workspace | `ManualSSO` / `backend` Nest app |
| Framework | NestJS 12 |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Database | PostgreSQL (`DATABASE_URL`) |
| Auth | JWT Bearer stored in `admin_tokens` / `user_tokens`. Decorators `@Admin()`, `@User()` |
| gRPC | Hybrid on `GRPC_PORT` (default 23001); `UserGrpcService.ValidateUserAppAccess` |
| Package manager | npm |
| API docs | Swagger `/api` when `NODE_ENV=test` |
| Entry | `backend/src/main.ts` → `backend/src/app.module.ts` |
| Architecture | Controller → application service → CommandBus/QueryBus → handler → repository → Prisma |
| CQRS | Used (`@nestjs/cqrs`). No sagas |
| Live modules | `AdminModule`, `MediaModule`, `AppsModule`, `UserModule` |

## Context index

| Need | File |
|------|------|
| Engineering rules | `context/12-engineering-rules.md` |
| Overview | `context/00-project-overview.md` |
| Architecture | `context/01-architecture.md` |
| Tech stack | `context/02-tech-stack.md` |
| Folders | `context/03-folder-structure.md` |
| Domain | `context/04-domain-design.md` |
| DB design | `context/05-database-design.md` |
| Models | `context/06-database-models.md` |
| CQRS | `context/07-cqrs-rules.md` |
| Coding | `context/08-coding-rules.md` |
| Repositories | `context/09-query-dataAccess-rules.md` |
| API | `context/10-api-design.md` |
| Swagger | `context/11-api-documentation.md` |

## Critical cautions

- `modules/app/app.module.ts`, its application service, infrastructure repository, and presentation controller are stale admin copies. Implement App from `domain/` contracts.
- `app.prisma` is invalid and is not in `prisma/schema.prisma`. Do not run `npm run build:schema` until that fragment is fixed or removed.
- `PrismaService.findByUnique` puts `deletedAt` inside `findUnique` `where`.
- `SmsRqRepository.softDelete` hard-deletes. `Tools.codeCreator()` returns `1234`. SMS send methods return before HTTP.
- `Tools.saveLogs` is the audit path (`CreateLogEvent`). Do not add a third logger.
- Never echo secrets from `main.ts` (session secret), `tools.helper.ts` (SMS key literal), `.env`, or JWT `secretKey`.

## Schema change

Edit `backend/src/modules/<feature>/infrastructure/models/*.prisma`, then from `backend/`: `npm run build:schema`, `npx prisma generate`, and `npx prisma db push` only when the task applies the database.

## Adding a module or feature

Use the ordered workflow in [manualsso-add-module](../manualsso-add-module/SKILL.md): domain (enums → VOs → entities with rules → interfaces → repository interfaces → use cases) → DTOs → mappers → repository impls → commands/handlers → queries/handlers → events/sagas if needed → application services → controllers → Nest module providers.

Return types: repositories → Entities; serviceImpl → domain interfaces; public services → DTOs.

## Testing

**Do not create or keep test files** for ManualSSO (`*.spec.ts`, `*.e2e-spec.ts`, unit/integration/e2e, frontend test suites). Per `context/12-engineering-rules.md` §14 and project preference: verify with build/API behavior only. Do not add tests even when a task generically asks for them, unless the user explicitly overrides this ManualSSO policy in that message.
