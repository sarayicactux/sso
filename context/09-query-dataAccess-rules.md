# 09 — Query and Data-Access Rules

## How to Use This Document

Persistence goes through infrastructure repositories and `PrismaService`. This project does not use a class named `DataAccess`. When a task says “data access”, it means the repository plus `PrismaService`.

## Call chain

```
Handler.execute / handle
  → Repository method
    → PrismaService helper or prisma.<delegate>.<method>
      → PostgreSQL
```

Application services call the bus, not the repository. The `@Admin()` decorator is the existing bypass (direct `PrismaService`). New controllers use `@Admin()` for the current admin and use a query when they need another row.

## Repository rules

| Rule | Class |
|------|-------|
| `@Injectable()` class in `infrastructure/repositories` | Established |
| `implements` the domain `*RepositoryImpl` interface | Established |
| Constructor injects `PrismaService` | Established |
| One repository per aggregate: `Admin`, `AdminToken`, `SmsRq`, `Log`, `Media` | Established |
| No HTTP types in the repository except the existing `MediaRepository` which takes `CreateMediaDTO` | Established. New methods should take domain interfaces |
| Cast the Prisma row `as Entity`. Do not map columns by hand unless the shape differs | Established |
| Swallowing errors and returning `null` (`MediaRepository.create`) hides constraint failures | Established there. Recommended for new code: let the error throw and map it in the service |

## PrismaService API

File: `backend/src/prisma/prisma.service.ts`. Extends `PrismaClient`. Connects on module init, disconnects on destroy.

`create()` on the service itself throws `Method not implemented`. Create rows with `this.prisma.<delegate>.create`, not `this.prisma.create()`.

Helpers take a delegate name string (`'admin'`, `'adminToken'`, `'log'`, `'smsRq'`, `'media'`).

| Method | Prisma call | `deletedAt` behavior |
|--------|-------------|----------------------|
| `findCount` | `count` | forces `null` |
| `findAll` | `findMany` | forces `null`, default `take: 10`, `skip: 0`, `orderBy id desc` |
| `findOne` | `findFirst` | forces `null` |
| `findByUnique` | `findUnique` | adds `deletedAt: null` inside unique `where` |
| `findDeleted` | `findMany` | `deletedAt not null` |
| `findWithDeleted` | `findMany(args)` | no extra filter |
| `softDelete` | `updateMany` | sets `deletedAt` to now. Argument is spread, so pass `{ where: {...} }` |
| `restore` | `updateMany` | sets `deletedAt` null. Same argument shape as `softDelete` |
| `forceDelete` | `deleteMany` | argument is the `where` object itself: `forceDelete('adminToken', { access_token })` |

Direct delegate calls used today:

| Call | Where |
|------|-------|
| `prisma.admin.create` / `admin.update` | `AdminRepository` |
| `prisma.adminToken.create` | `AdminTokenRepository` |
| `prisma.smsRq.create` / `update` / `delete` | `SmsRqRepository` |
| `prisma.log.create` | `LogRepository` |
| `prisma.media.create` / `update` / `delete` | `MediaRepository` |

Reads of admin, sms, log, and media go through the helpers.

## Choose a helper

| Need | Use |
|------|-----|
| One row by a unique field, alive only | Prefer `findOne` with `where: { mobile, deletedAt: null }` until `findByUnique` stops injecting `deletedAt` into `findUnique` |
| One row by non-unique filter | `findOne` |
| Page of alive rows | `findAll` and pass `skip` / `take` |
| Include relations | pass `include` on the args object |
| Insert | `prisma.<delegate>.create({ data })` |
| Update by id | `prisma.<delegate>.update({ where: { id }, data })` |
| Stamp deleted | `softDelete(delegate, { where })` |
| Remove the row | `forceDelete` or `delegate.delete` |
| Alive and deleted | `findWithDeleted` |

## `findByUnique` defect

```ts
return this[model].findUnique({
  where: { ...args.where, deletedAt: null },
  include: args.include ? args.include : null,
});
```

`AdminRepository.findById`, `findByMobile`, `findByUsername`, and `findByEmail` use this. `@Admin()` also calls `findByUnique('admin', ...)`. Prisma `findUnique` rejects a `where` that is not a unique selector. `deletedAt` is not in a unique index. New code should not add more `findByUnique` callers. A fix, when requested, is to use `findFirst` for “unique field AND deletedAt is null”, or `findUnique` with only the unique field and then reject a non-null `deletedAt` in the repository.

`include: null` is passed when the caller omits `include`. If a Prisma upgrade rejects `include: null`, pass `undefined` instead.

## `findAll` overwrite

```ts
where: { ...args.where, deletedAt: null }
```

A caller cannot ask `findAll` for deleted rows. `allIncludingDeleted` is affected. Use `findDeleted` or `findWithDeleted`.

## Soft vs hard

| Repository method | Implementation |
|-------------------|----------------|
| `SmsRqRepository.softDelete` | `prisma.smsRq.delete` |
| `AdminTokenRepository.delete` | `forceDelete` → `deleteMany` |
| `MediaRepository.delete` | `prisma.media.delete` |
| Admin delete | no method |

Name the new method after the real effect. If the product rule is soft delete, call `PrismaService.softDelete` and keep reads on the helpers so `deletedAt: null` still applies.

## Includes

`findById` / `findByMobile` for admin include `AdminTokens: true`. Login then maps the admin. The token returned to the client is the one just created, passed into `toAdminDto(admin, token)`, not an old token from the include.

Log and SMS reads do not include `Admin`.

## Pagination

`LogRepository.find` and `AdminRepository.findAll` compute `skip: (page - 1) * limit` with default page 1 and limit 10. There is no total-count envelope. `findCount` exists and is unused. A new list endpoint that needs a total calls `findCount` with the same `where` and returns both. Do not invent a page DTO until the task specifies the JSON shape; neighbors return a raw array.

## Filters

Build `where` in the repository from the domain find interface (`FindLogInterface`: optional `adminId`, `tableName`, `act`, `page`, `limit`). Ignore undefined fields. Do not pass the raw request object into Prisma.

## Writes and audit

After a successful command, the service may call `this.tools.saveLogs(...)`. The event handler inserts `logs` outside the business transaction. A failed log does not roll back the business write.

`CreateLogInterface.adminId` is required. Anonymous routes cannot audit until the schema allows a null admin.

## Transactions and raw SQL

No `$transaction` and no `$queryRaw` in the repositories that were read. New raw SQL needs a reason (a Prisma query cannot express it). Put it in the repository, not the controller.

## Schema edits

1. Change `infrastructure/models/<model>.prisma` only.
2. If relations change, update both sides in their module fragments.
3. From `backend/`: `npm run build:schema` then `npx prisma generate`.
4. Apply with `npx prisma db push` only when the task includes updating the database.
5. Do not generate while `app.prisma` is invalid. Fix or exclude that file first.
6. Delegate strings and `this.prisma.<delegate>` must match the generated client after `generate`.

## Seeding

`AdminService.seeder` reads env and dispatches `CreateAdminCommand` when the mobile is missing. It does not update an existing admin. Run `npm run seed:admin`. The command needs `DATABASE_URL`, `secretKey` is not required for seed, and the seed password is hashed before insert.

## Testing queries

There is no repository test suite. When adding tests, mock `PrismaService` and assert the `where` object, including `deletedAt`. Do not point tests at a production database URL.
