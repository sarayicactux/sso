# 11 — API Documentation

## How to Use This Document

Swagger is `@nestjs/swagger` on the controllers. The UI is not always on. Read this before adding `@Api*` decorators.

## When the UI is available

`backend/src/main.ts` always builds an OpenAPI document. It calls `SwaggerModule.setup('api', app, document)` only when `process.env.NODE_ENV.toLowerCase() === 'test'`.

| Item | Value |
|------|--------|
| UI path | `/api` (README also writes `http://domain.com/api/#/`) |
| Spec title | `sso-buy` from `backend/src/shared/config/swagger.json` |
| Description | `sso-buy APIs` |
| Version | `1.0.0` |
| Document tag | `sso-buy Apis` |
| Security scheme | `addBearerAuth()` (HTTP bearer) |
| Global prefix | none |

`NODE_ENV` is read with `.toLowerCase()`. If `NODE_ENV` is unset, that call throws and the process fails during bootstrap. Local `.env` must set it.

Production (`start:prod`) does not mount the UI unless `NODE_ENV` is `test`.

## Document metadata

Edit user-facing title text in `shared/config/swagger.json`, not in `main.ts`.

```json
{
  "title": "sso-buy",
  "description": "sso-buy APIs",
  "version": "1.0.0",
  "tag": "sso-buy Apis"
}
```

Per-route tags in controllers (`admin`, `media`) are separate from this document tag.

## Required decorator set for a new route

Match `AdminController` / `MediaController`:

```ts
@ApiOperation({
  summary: ' ورود مدیر  ',
  operationId: 'adminLogin',
  description: 'this operation is public',
  tags: ['admin'],
})
@ApiOkResponse({ description: 'admin login successful', type: AdminDto })
@ApiBody({ type: LoginDto, description: 'login admin DTO' })
@ApiNotFoundResponse({ description: 'admin not found' })
@ApiInternalServerErrorResponse({ description: 'login faild' })
```

Protected routes also use:

```ts
@ApiBearerAuth()
@ApiHeader({
  name: 'authorization Bearer ',
  description: 'this token recieved in login',
})
```

The header `name` includes a space and the word Bearer. Swagger shows that label. The runtime header is `authorization`. Do not invent a second auth header.

Recover-password documents header name `recover_pass_token`. That name matches the code (`headers.recover_pass_token`).

## operationId contract

`operationId` is the stable name for a route.

| Route | operationId | `@Admin` operationId |
|-------|-------------|----------------------|
| `POST /admins/login` | `adminLogin` | public, no decorator |
| `GET /admins/dash` | `adminDashboard` | `adminDashboard` |
| `GET /admins/logOut` | `adminLogOut` | `adminLogOut` |
| `PUT /admins/updatePassword` | `adminUpdatePassword` | `adminUpdatePassword` |
| `PUT /admins/forgetPass` | `adminForgetPassword` | public |
| `PATCH /admins/recoverPass` | `adminRecoverPassword` | public |
| `POST /medias/uploadFile` | `uploadFile` | `permissionCreate` |
| `DELETE /medias/:mediaId` | `deleteUploadFile` | `deleteUploadFile` |

New protected routes must use the same string in `@ApiOperation` and `@Admin`. Fix `uploadFile` / `permissionCreate` only when a task asks to align them.

## RBAC description sentence

`inRoleRoutes` (`shared/config/inRoleRoutes.ts`) keeps an operation when `description === 'this operation protected by RBAC'`.

Every current `@ApiOperation.description` is `this operation is public`, including bearer routes. The global `allRoutes` list is therefore empty, and nothing reads it for authorization.

When a task turns on RBAC, set the description to that exact sentence and keep `operationId` stable. Do not change the sentence spelling.

## DTO documentation

Put `@ApiProperty()` on DTO fields. Optional fields use `@ApiProperty({ required: false })` or `{ type, required: false }`, matching `LoginDto` and `CreateAppDto`.

`@ApiOkResponse({ type })` should be the class the method returns. Known mismatches to avoid copying:

| Route | Decorated success type | Runtime |
|-------|------------------------|---------|
| `POST /medias/uploadFile` | `[MediaDto]` | one media object |
| `PUT /admins/forgetPass` | `[String]` | `{ recoverPassToken }` |
| `PATCH /admins/recoverPass` | `AdminDto` | `boolean` |

## Bearer and try-it-out

`addBearerAuth()` plus `@ApiBearerAuth()` on the handler lets Swagger UI send `Authorization`. The token value is the `access_token` from login, without an extra prefix in the Swagger authorize box if the scheme is bearer (Swagger adds `Bearer`).

Login is public. Call it first, then authorize, then call `dash`.

## File upload docs

`POST /medias/uploadFile` uses `@ApiConsumes('multipart/form-data')` and an `@ApiBody` schema with `file` (binary) and `dist` (string). Keep that pair when the multipart fields change. A JSON `@ApiBody` will not describe this route.

## What is undocumented on purpose

- App CRUD (no controller).
- Internal commands and queries.
- Seed CLI.
- `CreateLog` (no HTTP).

Do not add Swagger for a handler that is not mounted.

## Checklist when the API changes

1. Decorate the new method using the set above.
2. Keep `operationId` unique across the document.
3. Point `@ApiOkResponse.type` at the real DTO.
4. If `NODE_ENV=test`, open `/api` and confirm the operation appears under the route’s tag.
5. Update [10-api-design.md](10-api-design.md) in the same change.
