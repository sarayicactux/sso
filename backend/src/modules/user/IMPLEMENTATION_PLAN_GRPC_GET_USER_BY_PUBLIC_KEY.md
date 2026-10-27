# gRPC GetUserByPublicKey

## Goal

Add a gRPC-only RPC that authenticates a calling app via `accessToken`, resolves a `UserToken` by `publicKey`, authorizes the user–app link, and returns safe user identity fields plus the user’s session `access_token`.

## Confirmed decisions (from code + task)

| Topic | Choice |
|-------|--------|
| RPC | `GetUserByPublicKey` on `UserGrpcService` |
| Request | `accessToken` (App), `publicKey` (`UserToken.publicKey`) |
| Response | `success`, identity fields (same as CreateUser), plus `access_token` from the matched `UserToken` |
| Errors | `RpcException` like CreateUser / UpdateUserStatusByUsername (not soft-fail like ValidateUserAppAccess) |
| App gate | `FindAppByAccessTokenQuery`; require `status === true` first |
| Token | `FindUserTokenByPublicKeyQuery`; return that row’s `access_token` (not App token); JWT must still verify; then clear `publicKey` to `""` (disposable / single-use) |
| User | `GetUserQuery` + `User.canAuthenticate` |
| AuthZ | `FindUserAppByUserIdAndAppIdQuery` after app + user resolved |
| REST | No HTTP route |
| Tests | None (project policy) |

## Phase 1 — Contracts

**Objective:** Proto + domain request/result interfaces.

**Files:** `user.proto`, `domain/interfaces/user/GetUserByPublicKey.interface.ts`, `domain/services/user.service.ts`

**Done when:** Types and proto define the RPC shape.

## Phase 2 — Service + gRPC controller

**Objective:** Ordered validation and response mapping.

**Files:** `application/services/user.service.ts`, `presentation/grpc/user.grpc.controller.ts`

**Steps:** Validate app token → publicKey → user active → UserApp link → return payload. No plaintext logging of tokens/keys.

**Done when:** Build passes; gRPC method wired.

## Phase 3 — Docs

**Files:** `context/10-api-design.md`, this plan.

## Final state

Implemented:

- Proto RPC `GetUserByPublicKey` + request/response messages (`access_token` field 9, `keepCase: true`)
- Domain `GetUserByPublicKeyInterface` / `GetUserByPublicKeyResult`
- `UserService.getUserByPublicKey` reuses `FindAppByAccessTokenQuery`, `FindUserTokenByPublicKeyQuery`, JWT verify, `GetUserQuery` + `canAuthenticate`, `FindUserAppByUserIdAndAppIdQuery`; after success clears `UserToken.publicKey` to `""`
- Partial unique index on non-empty `publicKey` (`prisma/relax_user_token_public_key_unique.sql`) so many spent `""` values are allowed
- `UserGrpcController.getUserByPublicKey` wired
- Context `10-api-design.md` updated
- No REST route; no test files
