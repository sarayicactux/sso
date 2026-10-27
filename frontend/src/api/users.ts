import client from './client'
import type { AppDto } from '../types/app'
import type {
  AssociateUserAppPayload,
  CreateUserPayload,
  RecoverPasswordPayload,
  RevokeUserAppPayload,
  UpdatePasswordPayload,
  UpdateUserStatusPayload,
  UserDto,
  UserLoginPayload,
} from '../types/user'

export const usersApi = {
  login(payload: UserLoginPayload) {
    return client.post<UserDto>('/users/login', payload)
  },
  dash() {
    return client.get<UserDto>('/users/dash')
  },
  logOut() {
    return client.get<boolean>('/users/logOut')
  },
  updatePassword(payload: UpdatePasswordPayload) {
    return client.put<boolean>('/users/updatePassword', payload)
  },
  forgetPass(mobile: string) {
    return client.put<{ recoverPassToken: string }>('/users/forgetPass', { mobile })
  },
  recoverPass(recoverPassToken: string, payload: RecoverPasswordPayload) {
    return client.patch<boolean>('/users/recoverPass', payload, {
      headers: { recover_pass_token: recoverPassToken },
    })
  },
  create(payload: CreateUserPayload) {
    return client.post<UserDto>('/users', payload)
  },
  list() {
    return client.get<UserDto[]>('/users')
  },
  updateStatus(id: number, payload: UpdateUserStatusPayload) {
    return client.patch<UserDto>(`/users/${id}/status`, payload)
  },
  getApps(userId: number) {
    return client.get<AppDto[]>(`/users/${userId}/apps`)
  },
  associateApp(userId: number, payload: AssociateUserAppPayload) {
    return client.post<UserDto>(`/users/${userId}/apps`, payload)
  },
  removeApp(userId: number, appId: number) {
    return client.delete<boolean>(`/users/${userId}/apps/${appId}`)
  },
  revokeApp(payload: RevokeUserAppPayload) {
    return client.delete<boolean>('/users/apps', { data: payload })
  },
}
