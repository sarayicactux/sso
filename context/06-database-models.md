# 06 — Database Models

## How to Use This Document

Columns below match `backend/prisma/schema.prisma` unless a row is marked **draft**. After a schema change, update this file in the same task.

Prisma types: `Int`, `String`, `DateTime`, `Boolean`, `Json`. `?` means optional. `@db.VarChar(n)` and `@db.SmallInt` are native types.

## Admin → `admins`

Source: `backend/src/modules/admin/infrastructure/models/admin.prisma`

| Field | Prisma | Constraints | Notes |
|-------|--------|-------------|-------|
| `id` | `Int` | PK, autoincrement | |
| `username` | `String` | unique, required | Seed from `USERNAME` |
| `password` | `String` | required | bcrypt hash. Mapper does not copy it onto `AdminDto` |
| `email` | `String` | unique, required | |
| `mobile` | `String` | unique, `@db.VarChar(11)` | Login key. Pipe accepts 11 digits `09…` or `+989…` (13 chars). The column is VarChar(11), so `+989…` does not fit |
| `firstName` | `String?` | | |
| `lastName` | `String?` | | |
| `createdAt` | `DateTime` | `@default(now())` | |
| `updatedAt` | `DateTime` | `@updatedAt` | |
| `deletedAt` | `DateTime?` | | |
| `AdminTokens` | `AdminToken[]` | relation | |
| `Logs` | `Log[]` | relation | |

Entity: `domain/entities/admin.entity.ts`. DTO: `AdminDto` (no password).

## AdminToken → `admin_tokens`

Source: `adminToken.prisma`

| Field | Prisma | Constraints | Notes |
|-------|--------|-------------|-------|
| `id` | `Int` | PK, autoincrement | |
| `device` | `String?` | | Not set by login |
| `ip` | `String?` | | From `@IpAddress()` |
| `access_token` | `String` | `@db.VarChar(240)`, required | JWT. Not unique in schema |
| `lastConfirmationId` | `Int?` | `@db.SmallInt` | Unused by current services |
| `adminId` | `Int` | FK → `Admin.id` | |
| `createdAt` / `updatedAt` / `deletedAt` | `DateTime` | same pattern | Logout hard-deletes |
| `Admin` | relation | required | |

## Log → `logs`

Source: `log.prisma` (also declares enum `DatabaseAct`)

| Field | Prisma | Constraints | Notes |
|-------|--------|-------------|-------|
| `id` | `Int` | PK, autoincrement | |
| `adminId` | `Int` | FK → `Admin.id` | Required. System jobs cannot log without an admin id |
| `tableName` | `String?` | | Example value `medias` |
| `rowId` | `Int?` | | |
| `act` | `DatabaseAct` | default `CREATE` | |
| `oldData` | `Json?` | | |
| `newData` | `Json?` | | |
| `description` | `String?` | | Persian text in media flows |
| timestamps | | | `deletedAt` present, unused by create path |
| `Admin` | relation | required | |

Create payload: `CreateLogInterface` (`adminId`, `tableName`, `rowId`, `act`, optional `oldData`/`newData`, `description`).

## SmsRq → `sms_rqs`

Source: `smsRq.prisma`

| Field | Prisma | Constraints | Notes |
|-------|--------|-------------|-------|
| `id` | `Int` | PK, autoincrement | |
| `mobile` | `String` | required | No FK to admin |
| `code` | `Int` | `@db.SmallInt` | Compared to body `code` with `!==` |
| `ip` | `String` | required | Part of lookup |
| `lastSentTime` | `DateTime` | required | Set in repository to `new Date()` on create and update |
| `sendCount` | `Int` | `@db.SmallInt`, default `1` | Forget-password stops updating after `sendCount > 4` |
| `jwtToken` | `String` | required | Recover JWT, 1 hour TTL |
| timestamps | | | Recover path hard-deletes the row |

No relation fields.

## Media → `medias`

Source: `media.prisma` (also declares enum `MimeType`)

| Field | Prisma | Constraints | Notes |
|-------|--------|-------------|-------|
| `id` | `Int` | PK, autoincrement | |
| `mediaUrl` | `String` | required | Relative path `{uploadedFiles}{dist}/{fileName}` |
| `ownerId` | `Int?` | | Polymorphic. Null means unattached |
| `ownerModel` | `String?` | | Model name string when attached |
| `mimeType` | `MimeType` | required | From extension |
| timestamps | | | Delete route hard-deletes |

No Prisma relation to `Admin` or `App`.

## App → `apps`

Source: `backend/src/modules/app/infrastructure/models/app.prisma`

| Field | Prisma | Constraints | Notes |
|-------|--------|-------------|-------|
| `id` | `Int` | PK autoincrement | |
| `title` | `String` | `@unique` | |
| `description` | `String` | | |
| `url` | `String` | `@unique` | |
| `mediaId` | `Int?` | FK → `Media.id` | |
| `adminId` | `Int` | FK → `Admin.id` | |
| `status` | `Boolean?` | `@default(true)` | Create/revoke user requires `true` |
| `activeSession` | `Boolean?` | `@default(true)` | |
| `accessToken` | `String?` | `@unique` | Client app credential |
| timestamps | | | `@@map("apps")` |
| `Media` / `Admin` / `UserApps` | relations | | |

## User → `users`

Source: `backend/src/modules/user/infrastructure/models/user.prisma`

| Field | Prisma | Constraints | Notes |
|-------|--------|-------------|-------|
| `id` | `Int` | PK autoincrement | |
| `username` / `email` / `mobile` | `String` | each `@unique`; mobile `@db.VarChar(11)` | Existence match uses any of these |
| `password` | `String` | required | bcrypt hash |
| `firstName` / `lastName` | `String?` | | |
| timestamps | | | |
| `UserTokens` / `UserApps` | relations | | |

## UserApp → `users_apps`

Source: `userApp.prisma`. Join User ↔ App. `@@unique([userId, appId])`. Revoke hard-deletes the row.

## UserToken → `user_tokens`

Source: `userToken.prisma`. Same shape as `admin_tokens` with `userId` FK. Logout hard-deletes by `access_token`.

| Field | Prisma | Constraints | Notes |
|-------|--------|-------------|-------|
| `id` | `Int` | PK autoincrement | |
| `device` / `ip` | `String?` | | |
| `access_token` | `String` | `@db.VarChar(240)` | JWT; not unique in schema |
| `publicKey` | `String?` | `@unique` | Nullable for existing rows; set by `POST /users/apps/:appId/publicKey` via `generateAppAccessToken()` |
| `lastConfirmationId` | `Int?` | `@db.SmallInt` | |
| `userId` | `Int` | FK → `User.id` | |
| timestamps | | | `deletedAt` present |

## Enum reference

```prisma
enum DatabaseAct { CREATE UPDATE DELETE READ }
enum MimeType { IMAGE VIDEO MUSIC DOCUMENT APP OTHER }
```

## Entity classes (TypeScript)

| Entity file | Constructed with `new` in repositories? |
|-------------|------------------------------------------|
| `admin.entity.ts` | No. Cast `as Admin` |
| `adminToken.entity.ts` | No. Cast |
| `log.entity.ts` | No. Cast |
| `smsRq.entity.ts` | No. Cast |
| `media.entity.ts` | No. Cast |
| `app.entity.ts` | No. Cast |
| `user.entity.ts` | No. Cast |
| `userApp.entity.ts` | No. Cast |
| `userToken.entity.ts` | No. Cast |

Mappers construct response DTOs (`new AdminDto`, `new AppDto`, `new UserDto`, `MediaMapper.mediaObject`). Password stays off response DTOs. User-facing app lists omit the app `accessToken` secret.
