# User status + admin user management

## Goal

Boolean `User.status` (default `true`), block inactive login, admin list/status/app-association APIs, admin Users UI.

## Endpoints (admin Bearer `@Admin`)

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/users` | — | `UserDto[]` (+ apps, no secrets) |
| PATCH | `/users/:id/status` | `{ status: boolean }` | `UserDto` |
| GET | `/users/:id/apps` | — | `AppDto[]` (no accessToken) |
| POST | `/users/:id/apps` | `{ appId: number }` | `UserDto` |
| DELETE | `/users/:id/apps/:appId` | — | `true` |

Keep existing public create/login and `DELETE /users/apps` (accessToken).

## Schema

`users.status Boolean @default(true)` via prisma model + `db push`.

## Domain

- `User.status`, `canAuthenticate()`, `canGrantAppAccess()` require active status.
- Login / gRPC validate reject inactive users.
