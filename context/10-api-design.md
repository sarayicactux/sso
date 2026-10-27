# 10 — API Design

## How to Use This Document

Public HTTP is the controller list below. Base URL is the process origin (`APP_PORT`). There is no global prefix and no `/api/v1` path. `/api` is Swagger UI in the test environment, not a route prefix.

## Conventions

| Topic | Rule |
|-------|------|
| Style | Verb paths on a plural resource: `/admins/login`, `/medias/uploadFile` |
| Success code | `@HttpCode(HttpStatus.OK)` (200), including writes |
| Auth header | `Authorization: Bearer <access_token>` |
| Recover header | `recover_pass_token: <jwt>` on `PATCH /admins/recoverPass` |
| Body | JSON. Upload is `multipart/form-data` |
| Error body | `{ status: <number>, error: <string> }` from `HttpException` |
| Validation errors | Default Nest `ValidationPipe` body (array of messages). Not the `{ status, error }` shape |
| Pagination | Not exposed on admin HTTP. Helpers default `take` 10 for internal lists |
| Idempotency | Logout deletes tokens by access token. A second logout throws if the token row is already gone (handler does not catch) |

## Auth model

1. `POST /admins/login` returns `AdminDto` with `access_token`.
2. Protected handlers add `@Admin({ operationId: '<swagger operationId>' })`.
3. The decorator loads the token row and the admin. Missing header, unknown token, bad JWT, or missing admin → 403 with a Persian `error`.
4. `operationId` is not checked. Any live admin token can call any protected route.
5. Login JWT lifetime is 30 days (`86400 * 30` seconds). Recover JWT lifetime is 1 hour.

## Admin routes

Controller: `@Controller('admins')` in `modules/admin/presentation/controllers/admin.controller.ts`.

| Method | Path | Auth | Body / headers | Success | Notes |
|--------|------|------|----------------|---------|-------|
| `POST` | `/admins/login` | Public | `LoginDto`: `username`, `password` (min 6). IP from `@IpAddress()` | `AdminDto` | 403 `اطلاعات ورود نا معتبر است` when username missing or password mismatch |
| `GET` | `/admins/dash` | Bearer | | `AdminDto` of the token’s admin | `operationId` `adminDashboard` |
| `GET` | `/admins/logOut` | Bearer | | `true` | Deletes `admin_tokens` row for this access token. `operationId` `adminLogOut` |
| `PUT` | `/admins/updatePassword` | Bearer | `UpdatePasswordDto`: `oldPassword`, `newPassword` (min 6) | `true` | 403 `رمز عبور قدیمی نا معتبر است`. `operationId` `adminUpdatePassword` |
| `PUT` | `/admins/forgetPass` | Public | `{ mobile }` through `MobilePipe` | `{ recoverPassToken }` | 500 when mobile has no admin. SMS send is a no-op. Code is `1234`. After `sendCount > 4`, returns the previous token and does not rotate the code |
| `PATCH` | `/admins/recoverPass` | Public | Header `recover_pass_token`. Body `RecoverPasswordDto`: `code` (`@IsInt`), `newPassword`. `CodePipe` | `true` | 403 when header missing, JWT invalid, or SMS row/code mismatch. 406 `کد ارسال نا معتبر است` when payload code mismatches. Then hard-deletes the SMS row and sets the password |

`ForgetPasswordDto` exists and is not the type used by the handler. The handler types the body as `{ mobile: string }`. `MobilePipe` is the mobile check on that route.

`RegisterDto` has no route.

## Media routes

Controller: `@Controller('medias')`, class-level `@ApiBearerAuth()` and `@ApiTags('medias')`.

| Method | Path | Auth | Body | Success | Notes |
|--------|------|------|------|---------|-------|
| `POST` | `/medias/uploadFile` | Bearer | multipart field `file` (max 10_000_000 bytes) and `dist` string | media DTO | `@Admin({ operationId: 'permissionCreate' })`. Swagger operationId on the same method is `uploadFile`. Multer stores under `pathes.staticFiles + pathes.uploadedFiles`. Empty file falls through with no return |
| `DELETE` | `/medias/:mediaId` | Bearer | `mediaId` integer (`ParseIntPipe`, failure 406) | `true` or `false` | `operationId` `deleteUploadFile`. 404 `فایل پیدا نشد`. If `ownerId` is set, returns `true` and does not delete. Disk errors return `false` |

## User routes

Controller: `@Controller('users')` in `modules/user/presentation/controllers/user.controller.ts`.

| Method | Path | Auth | Body / headers | Success | Notes |
|--------|------|------|----------------|---------|-------|
| `POST` | `/users` | Public | `CreateUserDto`: user fields + app `accessToken` | `UserDto` (+ apps, `status`) | Validates active app; creates user (`status` default `true`) and/or `UserApp`. Conflict if identity fields map to different users. Inactive users cannot receive grants |
| `GET` | `/users` | Bearer `@Admin()` | | `UserDto[]` (+ apps, no secrets) | Admin user list |
| `PATCH` | `/users/:id/status` | Bearer `@Admin()` | `{ status: boolean }` | `UserDto` | Activate/deactivate |
| `GET` | `/users/:id/apps` | Bearer `@Admin()` | | `AppDto[]` (no `accessToken`) | Apps linked to user |
| `POST` | `/users/:id/apps` | Bearer `@Admin()` | `{ appId }` | `UserDto` | Associate app; 409 if duplicate |
| `DELETE` | `/users/:id/apps/:appId` | Bearer `@Admin()` | | `true` | Remove association only |
| `DELETE` | `/users/apps` | Bearer `@Admin()` | `RevokeUserAppDto`: `accessToken`, `userId` | `true` | Hard-deletes `UserApp` by app token. 404 if link missing |
| `POST` | `/users/login` | Public | `LoginDto`: `username`, `password` (min 6) | `UserDto` with `access_token` and `apps` | 403 `Invalid login credentials` or `User account is inactive` |
| `POST` | `/users/apps/:appId/publicKey` | Bearer `@User()` | `appId` path param | `AppPublicKeyDto`: `publicKey`, `url` (`{app.url}?pk={publicKey}`) | Validates user + active app + `UserApp` link; updates latest `UserToken.publicKey` for `userId` (no `access_token` check). 404 inactive/missing app; 403 no access / inactive user |
| `GET` | `/users/dash` | Bearer `@User()` | | `UserDto` with apps | `operationId` `userDashboard`; inactive users forbidden |
| `GET` | `/users/logOut` | Bearer `@User()` | | `true` | Deletes `user_tokens` row |
| `PUT` | `/users/updatePassword` | Bearer `@User()` | `UpdatePasswordDto` | `true` | 403 bad old password |
| `PUT` | `/users/forgetPass` | Public | `{ mobile }` + `MobilePipe` | `{ recoverPassToken }` | Mirrors admin SMS stub flow |
| `PATCH` | `/users/recoverPass` | Public | Header `recover_pass_token`; `RecoverPasswordDto` | `true` | Mirrors admin recover |

## User gRPC

Package `user`, service `UserGrpcService`, proto `modules/user/presentation/grpc/user.proto`. Listen URL `0.0.0.0:${GRPC_PORT}` (default `23001`).

| RPC | Request | Response | Notes |
|-----|---------|----------|-------|
| `ValidateUserAppAccess` | `accessToken` (App), `access_token` (UserToken); loader `keepCase: true` | `{ valid, id, username, email, mobile, firstName, lastName, status }` | `valid: true` + user identity (no `access_token`/`apps`/timestamps) when app is active, token row exists, JWT verifies, user exists/active, and `UserApp` links them. Any failure → `valid: false` with empty defaults (no throw) |
| `UpdateUserStatusByUsername` | `username`, `status` (bool), `accessToken` (App) | `{ success: bool, status: bool }` | Validates App `accessToken` (active). Sets user `status` by username. gRPC errors: `INVALID_ARGUMENT`, `PERMISSION_DENIED` (bad token), `NOT_FOUND` (unknown user), `INTERNAL` |
| `CreateUser` | `username`, `email`, `mobile`, `firstName`, `lastName`, `password`, `accessToken` (App) | `{ success, id, username, email, mobile, firstName, lastName, status }` | Validates App `accessToken` (active) **before** create. Reuses REST create rules (`status` default `true`, link `UserApp`). No password/tokens/apps in response. Errors: `INVALID_ARGUMENT`, `PERMISSION_DENIED`, `ALREADY_EXISTS` (identity conflict), `INTERNAL` |
| `GetUserByPublicKey` | `accessToken` (App), `publicKey` (`UserToken.publicKey`) | `{ success, id, username, email, mobile, firstName, lastName, status, access_token }` | App token first; resolve `UserToken` by `publicKey`; JWT must verify; user active + `UserApp` link required; returns that row’s user `access_token` (not App token); then clears `publicKey` to `""` (single-use). No password. Errors: `INVALID_ARGUMENT`, `PERMISSION_DENIED`, `NOT_FOUND`, `INTERNAL` (consume failure) |

## Status codes in use

| Code | When |
|------|------|
| 200 | Explicit `@HttpCode(OK)` on the routes above |
| 403 | Auth failures, bad login, bad old password |
| 404 | Media id not found; user–app link missing on revoke |
| 409 | User create identity fields match different users |
| 406 | `ParseIntPipe` on `mediaId`. Recover payload code mismatch (`NOT_ACCEPTABLE`) |
| 424 | `FAILED_DEPENDENCY` from `MobilePipe` / `CodePipe` |
| 500 | Forget-password when the admin row is missing. Recover when the admin disappears after the SMS check |
| 400 | Media upload `catch` maps every error to `BAD_REQUEST` |

## Response bodies

`AdminDto` fields: `id`, `username`, `firstName`, `lastName`, `email`, `mobile`, `access_token`, `createdAt`, `updatedAt`. Password is omitted.

`UserDto` same identity fields plus `status` (boolean), optional `apps` (`AppDto` list without app secret token) and `access_token` after login.

`MediaDto`: see `presentation/dtos/media.dto.ts` (`mediaObject` mapper). Upload returns that object. The controller’s Swagger type says `[MediaDto]` (array) while the service returns one object.

Forget-password returns `{ recoverPassToken }`. Swagger `@ApiOkResponse` type is `[String]`, which does not match.

## Client rules for new endpoints

- Pick the next path on the existing controller or a new `@Controller('<plural>')`.
- Add `@ApiOperation({ operationId, summary, description, tags })`. Use a unique `operationId`. Summary may be Persian, matching admin routes.
- If the route needs an admin, add `@ApiBearerAuth()` and `@Admin({ operationId })` with the same id.
- Return a DTO instance from the mapper.
- Throw `HttpException` with `{ status, error }` for domain failures.
- Keep login error text generic when the failure would reveal whether a username exists. Forget-password currently uses 500 for unknown mobiles; do not copy that for new account lookups. Use the login-style 403.
- File uploads stay on `medias` until a task moves them. Other modules store `ownerId` / `ownerModel` through `UpdateMediaOwnerCommand` after the row exists.

## CORS and body limits

`main.ts` allows credentialed CORS with reflected origin from `enableCors({ origin: true })` and also sets `Access-Control-Allow-Origin: *`. JSON bodies up to 50mb. Upload validator caps a single file at 10_000_000 bytes.

## Seeds and CLIs (not HTTP)

| Script | Effect |
|--------|--------|
| `npm run seed:admin` | Inserts one admin from env if `MOBILE` is unknown |
| `npm run console` | Boots and closes the application context |
