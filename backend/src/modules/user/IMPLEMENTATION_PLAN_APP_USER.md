# AppUser access validation

## Goal

Persist `AppUser` (App ↔ User via `userId`) when SSO handoff succeeds with `activeSession === false`, and require that association in `ValidateUserAppAccess`.

## Decisions

| Topic | Choice |
|-------|--------|
| Model | `AppUser` / table `app_user` (`userId`, `appId`) — not `AppUserToken` / `userTokenId` |
| Create when | `getUserByPublicKey` only when `activeSession === false` |
| Create how | Hard-delete via `DeleteAppUserCommand`, then insert via `CreateAppUserCommand` |
| `activeSession === true` | Do not create/delete `AppUser` |
| Validate | If `activeSession === false`, require `AppUser` for `(userId, appId)` |

## Final state

Renamed from AppUserToken → AppUser and userTokenId → userId across repository, CQRS, service, and docs.
