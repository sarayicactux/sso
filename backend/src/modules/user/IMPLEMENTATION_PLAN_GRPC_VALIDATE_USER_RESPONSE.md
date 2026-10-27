# gRPC ValidateUserAppAccess — return trimmed user

## Goal

Change `ValidateUserAppAccess` response from `{ valid }` only to `{ valid }` plus UserDto-like identity fields, omitting `access_token`, `apps`, `createdAt`, and `updatedAt` (same safe shape as `CreateUser` gRPC).

## Decisions

| Topic | Choice |
|-------|--------|
| Response fields | `valid`, `id`, `username`, `email`, `mobile`, `firstName`, `lastName`, `status` |
| Failures | Still no throw; `valid: false` with proto3 zero defaults |
| Success | `valid: true` + user identity from DB |
| Proto | Extend `ValidateUserAppAccessResponse` (field 1 stays `valid`) |

## Phases

### Phase 1 — Contracts
- **Objective:** Result type + proto match CreateUser safe response.
- **Files:** `ValidateUserAppAccess.interface.ts`, `user.proto`, `domain/services/user.service.ts`
- **Steps:** Add `ValidateUserAppAccessResult`; expand proto message; update `UserServiceImpl` return type.
- **Validation:** Types compile; proto field numbers stable for `valid = 1`.
- **Done when:** Interface and proto define the new shape.

### Phase 2 — Service + controller
- **Objective:** Return user payload when access is valid.
- **Files:** `user.service.ts`, `user.grpc.controller.ts`
- **Steps:** On success path return mapped fields; on any failure return invalid defaults; controller passes through result.
- **Validation:** Build succeeds.
- **Done when:** gRPC method returns the new object.

### Phase 3 — Docs
- **Objective:** Context and plan reflect new response.
- **Files:** `context/10-api-design.md`, `context/04-domain-design.md`, this plan
- **Done when:** API table lists the new response fields.

## Status

Phases 1–3 complete. Response shape matches `CreateUser` safe fields plus `valid`. Build verified.
