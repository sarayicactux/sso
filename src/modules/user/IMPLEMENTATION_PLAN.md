# UserModule implementation plan

## Goal

Build a live `UserModule` for end-user SSO accounts linked to Apps via `UserApp`. Follow manualsso-add-module layering and Admin CQRS patterns. Replace admin-named stubs in this folder.

## Confirmed decisions

| Topic | Choice |
|-------|--------|
| Create / revoke auth | Public routes; body includes app `accessToken` |
| “User exists” match | Any of `mobile` / `email` / `username` |
| Ambiguous match | Distinct users → 409 conflict |
| Existing `UserApp` on create | Idempotent |
| Revoke | Hard-delete `UserApp`; body `{ accessToken, userId }` |
| Create body | User fields + `accessToken` |
| App gate | `FindAppByAccessTokenQuery`; app active |
| Login | mobile + password; JWT + user_tokens; apps in DTO |
| Protected routes | `@User()` → userToken / userId |
| Password recover | Reuse Admin SmsRq flow with `userId` in JWT |
| `UserApp` | `@@unique([userId, appId])` |
| Errors | English `{ status, error }` |
| Tests | None |

## Phases (completed)

0–10 implemented. `UserModule` registered in root. Routes under `/users`. Prisma `User` / `UserApp` / `UserToken` live. Context docs updated in phase 11.

See Cursor plan `user_module_plan` for historical phase detail.
