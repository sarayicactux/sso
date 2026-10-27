# gRPC UpdateUserStatusByUsername

## Goal

App-authenticated gRPC RPC to set a user’s `status` by `username`.

## Inputs

`username`, `status` (bool), `accessToken` (App) — `keepCase: true`.

## Rules

1. Resolve app by `accessToken`; require active app (reuse `FindAppByAccessTokenQuery` pattern).
2. Resolve user by username; NOT_FOUND if missing.
3. Persist via existing `UpdateUserStatusCommand`.
4. gRPC only (no REST). Errors via `RpcException`.

## Done

- Proto RPC + Nest `UserGrpcController` method
- `UserService.updateStatusByUsernameViaApp` (app token + username + `UpdateUserStatusCommand`)
- Context API docs updated
