import client from './client'
import type {
  AdminDto,
  AdminLoginPayload,
  RecoverPasswordPayload,
  UpdatePasswordPayload,
} from '../types/admin'

export const adminsApi = {
  login(payload: AdminLoginPayload) {
    return client.post<AdminDto>('/admins/login', payload)
  },
  dash() {
    return client.get<AdminDto>('/admins/dash')
  },
  logOut() {
    return client.get<boolean>('/admins/logOut')
  },
  updatePassword(payload: UpdatePasswordPayload) {
    return client.put<boolean>('/admins/updatePassword', payload)
  },
  forgetPass(mobile: string) {
    return client.put<{ recoverPassToken: string }>('/admins/forgetPass', { mobile })
  },
  recoverPass(recoverPassToken: string, payload: RecoverPasswordPayload) {
    return client.patch<boolean>('/admins/recoverPass', payload, {
      headers: { recover_pass_token: recoverPassToken },
    })
  },
}
