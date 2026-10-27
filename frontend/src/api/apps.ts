import client from './client'
import type { AppDto, CreateAppPayload, UpdateAppPayload } from '../types/app'

export const appsApi = {
  list() {
    return client.get<AppDto[]>('/apps')
  },
  create(payload: CreateAppPayload) {
    return client.post<AppDto>('/apps', payload)
  },
  getById(id: number) {
    return client.get<AppDto | null>(`/apps/${id}`)
  },
  getByAccessToken(accessToken: string) {
    return client.get<AppDto | null>(`/apps/by-token/${encodeURIComponent(accessToken)}`)
  },
  update(id: number, payload: UpdateAppPayload) {
    return client.put<boolean>(`/apps/${id}`, payload)
  },
  updateStatus(id: number, status: boolean) {
    return client.patch<boolean>(`/apps/${id}/status`, { status })
  },
  updateActiveSession(id: number, activeSession: boolean) {
    return client.patch<boolean>(`/apps/${id}/activeSession`, { activeSession })
  },
  regenerateAccessToken(id: number) {
    return client.patch<AppDto | null>(`/apps/${id}/accessToken`)
  },
}
