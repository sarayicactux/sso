import type { MediaDto } from './media'

export interface AppDto {
  id: number
  title: string
  description: string
  url: string
  mediaId?: number
  Media?: MediaDto | null
  adminId: number
  status: boolean
  activeSession: boolean
  accessToken?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateAppPayload {
  title: string
  description: string
  url: string
  mediaId?: number
}

export interface UpdateAppPayload {
  title?: string
  description?: string
  url: string
  mediaId?: number
}
