# gRPC ValidateUserAppAccess

## Goal

gRPC RPC that checks whether a user session token is valid and the user has access to the app identified by the app `accessToken`. Returns boolean only.

## Decisions

| Topic | Choice |
|-------|--------|
| Packages | `@nestjs/microservices`, `@grpc/grpc-js`, `@grpc/proto-loader` |
| Port env | `GRPC_PORT` (dev value `23001`) |
| Inputs | `accessToken` (App), `access_token` (UserToken) via `keepCase: true` |
| Failures | Return `false` (do not throw) |
| Valid | App active + token row + JWT ok + user exists + UserApp link |

## Steps (done)

1. Proto + nest-cli asset copy
2. Repository/query for user token by `access_token`
3. `UserService.validateUserAppAccess`
4. gRPC controller; register in `UserModule`
5. Hybrid bootstrap in `main.ts` (`GRPC_PORT`)
6. Context docs
