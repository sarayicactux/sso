# AppUser access validation

## Goal

When `App.activeSession === false`, bind a user session JWT to an app in `app_user`, and require that bound token on `ValidateUserAppAccess`.

Source of truth for this behavior: git commit `accfa2d` (`check active session`).

## Decisions

| Topic | Choice |
|-------|--------|
| Model | `AppUser` / table `app_user`: `userId`, `appId`, `access_token` (`@@unique([userId, appId])`) |
| Distinct from | `UserApp` / `users_apps` (grant link only; no session JWT) |
| Create when | `getUserByPublicKey` only when `activeSession === false` |
| Create how | `DeleteAppUserCommand(userId, appId)` then `CreateAppUserCommand({ userId, appId, access_token })` |
| `access_token` stored | From the `UserToken` resolved by `publicKey` |
| `activeSession !== false` | Do not create/delete `AppUser` |
| Validate | If `activeSession === false`: `AppUser` must exist for `(userId, appId)` **and** `AppUser.access_token ===` request `access_token`; else `invalidUserAppAccess` |
| Soft-delete | Not used for this workflow |

## Layers

- Domain: `appUser` entity, `CreateAppUserInterface`, `AppUserRepositoryImpl`
- Infra: `appUser.prisma`, `AppUserRepository`
- CQRS: `CreateAppUser*`, `DeleteAppUser*`, `FindAppUserByUserIdAndAppId*`
- Wired in `UserModule`

## Final state

Aligned with commit `check active session`: `AppUser.access_token` is part of create + validate match rules.
