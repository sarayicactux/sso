# gRPC CreateUser

## Goal

App-authenticated gRPC RPC to create (or link) a user, reusing REST `UserService.create` rules.

## Inputs

`username`, `email`, `mobile`, `firstName`, `lastName`, `password`, `accessToken` (App) — loader `keepCase: true`.

## Rules

1. Validate required fields; reject missing/blank `accessToken` before any create.
2. Resolve app by `accessToken`; require active app (`FindAppByAccessTokenQuery`). Fail closed with `PERMISSION_DENIED`.
3. Reuse `UserService.create` (existing user match / create with `status: true` / `UserApp` grant).
4. Map HTTP errors from `create` to `RpcException`. Response: safe user fields only (no password, no tokens, no apps).
5. gRPC only (no new REST).

## Phases

| Phase | Objective | Files | Validation |
|-------|-----------|-------|------------|
| 1 | Proto RPC + messages | `user.proto` | Proto loads with Nest gRPC |
| 2 | Interface + service + controller | interfaces, `user.service.ts`, `user.grpc.controller.ts`, domain service | Build |
| 3 | Docs | `context/10-api-design.md` | Mentions CreateUser |

## Completion

- [x] Proto `CreateUser` RPC
- [x] `UserService.createViaApp` validates token then calls `create`
- [x] Safe gRPC response; docs updated; backend build (see verify step)
