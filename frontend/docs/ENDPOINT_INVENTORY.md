# ManualSSO Frontend — REST Endpoint Inventory

Source of truth: Nest controllers under `backend/src/modules/*/presentation/controllers`.  
**Out of scope:** gRPC `ValidateUserAppAccess`.

Base URL: Vite proxies `/api/*` → backend origin with `/api` stripped (no Nest global prefix).

## Mapping

| Method | Backend path | Frontend API | UI |
|--------|--------------|--------------|-----|
| POST | `/admins/login` | `adminsApi.login` | Admin login |
| GET | `/admins/dash` | `adminsApi.dash` | Admin session bootstrap / dashboard |
| GET | `/admins/logOut` | `adminsApi.logOut` | Admin logout |
| PUT | `/admins/updatePassword` | `adminsApi.updatePassword` | Admin change password modal |
| PUT | `/admins/forgetPass` | `adminsApi.forgetPass` | Admin forgot password |
| PATCH | `/admins/recoverPass` | `adminsApi.recoverPass` | Admin recover password |
| POST | `/users/login` | `usersApi.login` | User login |
| GET | `/users/dash` | `usersApi.dash` | User session / dashboard |
| GET | `/users/logOut` | `usersApi.logOut` | User logout |
| PUT | `/users/updatePassword` | `usersApi.updatePassword` | User change password |
| PUT | `/users/forgetPass` | `usersApi.forgetPass` | User forgot password |
| PATCH | `/users/recoverPass` | `usersApi.recoverPass` | User recover password |
| POST | `/users` | `usersApi.create` | Admin Users — create / grant app |
| GET | `/users` | `usersApi.list` | Admin Users list |
| PATCH | `/users/:id/status` | `usersApi.updateStatus` | Activate / deactivate |
| GET | `/users/:id/apps` | `usersApi.getApps` | Apps modal |
| POST | `/users/:id/apps` | `usersApi.associateApp` | Apps modal add |
| DELETE | `/users/:id/apps/:appId` | `usersApi.removeApp` | Apps modal remove |
| DELETE | `/users/apps` | `usersApi.revokeApp` | Legacy revoke by app token |
| GET | `/apps` | `appsApi.list` | Admin Apps list |
| POST | `/apps` | `appsApi.create` | Admin Apps — add modal |
| GET | `/apps/:id` | `appsApi.getById` | Admin Apps edit preload |
| PUT | `/apps/:id` | `appsApi.update` | Admin Apps — edit modal |
| PATCH | `/apps/:id/status` | `appsApi.updateStatus` | Admin Apps status switch |
| PATCH | `/apps/:id/activeSession` | `appsApi.updateActiveSession` | Admin Apps session switch |
| PATCH | `/apps/:id/accessToken` | `appsApi.regenerateAccessToken` | Admin Apps regenerate token |
| GET | `/apps/by-token/:accessToken` | `appsApi.getByAccessToken` | Optional lookup |
| POST | `/medias/uploadFile` | `mediasApi.uploadFile` | App form optional media |
| DELETE | `/medias/:mediaId` | `mediasApi.delete` | Optional media cleanup |

## Auth model

- Header: `Authorization: Bearer <access_token>`
- Admin vs user roles are separate token stores (`admin` | `user`)
- Protected routes: `meta.role === 'admin' | 'user'`
