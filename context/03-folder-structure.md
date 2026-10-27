# 03 — Folder Structure

## How to Use This Document

Paths are relative to the workspace root `ManualSSO/`. Application code lives under `backend/`. Ignore `backend/dist/`, `backend/node_modules/`, and `backend/dist/src/modules/admin - Copy/`.

## Repository top

```
ManualSSO/
  context/                 this knowledge base (00–12)
  .cursor/rules/           always-on rule → context/12-engineering-rules.md
  .cursor/skills/          project skill manualsso-engineering
  backend/                 NestJS application
```

There is no frontend package in this workspace.

## `backend/`

```
backend/
  package.json
  nest-cli.json            sourceRoot src, deleteOutDir
  tsconfig.json
  tsconfig.build.json
  prisma.config.ts         Prisma 7 datasource URL
  prisma/
    base.prisma            generator + datasource only
    combine.js             concatenates base + module *.prisma
    schema.prisma          generated output. Do not hand-edit as the source of truth
  src/
    main.ts
    app.module.ts
    console.ts
    modules/
    prisma/
    shared/
```

`prisma/migrations/` is referenced by `prisma.config.ts` and is not in the tree. Schema changes ship with `prisma db push` (see README).

## Feature module layout

Use this shape for a new module. `admin` is the reference. `media` matches it with fewer aggregates. `app` matches it only in `domain/` plus DTO/mapper/prisma draft.

```
src/modules/<feature>/
  <feature>.module.ts
  application/
    services/<feature>.service.ts
    commands/<aggregate>/<action>/<action>.command.ts
    commands/<aggregate>/<action>/<action>.handler.ts
    queries/<aggregate>/<query>.query.ts
    queries/<aggregate>/<query>.handler.ts
    events/<aggregate>/<event>.event.ts          optional
    events/<aggregate>/<event>.handler.ts        optional
  domain/
    entities/<aggregate>.entity.ts
    repositories/<aggregate>.repository.ts       interface, suffix Impl
    services/<feature>.service.ts                interface, suffix Impl
    controllers/<feature>.controller.interface.ts
    interfaces/<aggregate>/<Name>.interface.ts
    events/                                      optional domain event interface
    enums/                                       optional
  infrastructure/
    models/<aggregate>.prisma
    repositories/<aggregate>.repository.ts       @Injectable class
    mappers/<aggregate>.mapper.ts
  presentation/
    controllers/<feature>.controller.ts
    dtos/<feature>.dto.ts
```

Admin command folders use a verb path: `application/commands/admin/create/`, `application/commands/sms_rq/update/`. Media uses `application/commands/create/` without an extra aggregate folder. New aggregates inside admin should keep the admin style (`commands/<aggregate>/<verb>/`). A brand-new small module may follow media.

## File naming that already exists

| Kind | Pattern | Example |
|------|---------|---------|
| Nest module | `<feature>.module.ts` | `admin.module.ts` |
| HTTP controller | `<feature>.controller.ts` | `admin.controller.ts` |
| Application service | `<feature>.service.ts` | `admin.service.ts` |
| Command | `<verb>.command.ts` or `<verb><Aggregate>.command.ts` | `createAdmin.command.ts` |
| Handler | same stem + `.handler.ts` | `createAdmin.handler.ts` |
| Query | `getAdminByMobile.query.ts` | also imported as `GetAdminByMobile.query` |
| Prisma fragment | `<aggregate>.prisma` | `admin.prisma` |
| Mapper | `<aggregate>.mapper.ts` | `admin.mapper.ts` |
| DTO file | `<feature>.dto.ts` with several classes | `admin.dto.ts` |

**Portability:** `admin.module.ts` imports `./application/queries/admin/GetAdminByMobile.handler` while the file on disk is `getAdminByMobile.handler.ts`. The handler imports `./GetAdminByMobile.query` while the file is `getAdminByMobile.query.ts`. `forceConsistentCasingInFileNames` is false, so Windows builds. New files must use one casing and the import must match the filename byte-for-byte.

## `src/prisma/`

| File | Role |
|------|------|
| `prisma.module.ts` | Provides and exports `PrismaService` |
| `prisma.service.ts` | `PrismaClient` subclass + soft-delete helpers |

## `src/shared/`

| Path | Role |
|------|------|
| `commands/seed-admin.ts` | Nest application-context seed entry |
| `commands/seedAdmin.command.ts` | Calls `AdminService.seeder` |
| `config/pathes.ts` | Static dir `../public`, uploads `/files/`, site `http://localhost:4556`, client `http://localhost:3003` |
| `config/swagger.json` | Title, description, version, tag |
| `config/inRoleRoutes.ts` | Filters Swagger paths for the RBAC description sentence |
| `decorators/admin.decorator.ts` | `@Admin()` param decorator. Live |
| `decorators/user.decorator.ts` | `@User()` for user Bearer JWT (`user_tokens`) |
| `decorators/ipaddress.decorator.ts` | `@IpAddress()` |
| `enums/databaseAct.enum.ts` | `DatabaseAct` plus Persian labels default export |
| `enums/mimeType.enum.ts` | `MimeType` plus Persian labels |
| `event/events.module.ts` | Global event-emitter |
| `helpers/jwt.helper.ts` | Sign / verify |
| `helpers/tools.helper.ts` | SMS stubs, MIME, slug, `saveLogs`, `codeCreator` |
| `helpers/notFound.helper.ts` | Filter class. Not registered |
| `middlewares/logging.middleware.ts` | Access log |
| `middlewares/filename.middleware.ts` | Multer filename |
| `pipes/mobile.pipe.ts` | Iranian mobile check |
| `pipes/code.pipe.ts` | 4-digit code check |
| `interfaces/ItemCreator.interface.ts` | Shared creator shape |
| `leakyService.service.ts` | Disabled |

## Generated and vendor trees (do not extend)

| Path | Why it exists |
|------|----------------|
| `backend/dist/` | `nest build` output, including a stale `admin - Copy` compile |
| `backend/.agents/skills/`, `backend/.claude/skills/`, `backend/.windsurf/skills/` | Upstream Prisma skills |
| `backend/skills-lock.json` | Lock for those skill packs |

## Where a change goes

| Change | Location |
|--------|----------|
| New HTTP route | `presentation/controllers` + DTO + module `controllers` array |
| New business rule | `application/services` |
| New write | `application/commands/...` + handler + repository method |
| New read | `application/queries/...` + handler + repository method |
| New column | `infrastructure/models/*.prisma`, then `npm run build:schema` |
| New shared guard/pipe | `src/shared/` and register it where used |
| Docs for agents | `context/` only. README stays setup commands |
