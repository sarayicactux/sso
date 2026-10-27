import type { AppDto } from './app'

export interface UserDto {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  mobile: string
  status: boolean
  access_token?: string
  apps?: AppDto[]
  createdAt?: string
  updatedAt?: string
}

export interface UserLoginPayload {
  username: string
  password: string
}

export interface CreateUserPayload {
  username: string
  email: string
  mobile: string
  firstName?: string
  lastName?: string
  password: string
  accessToken: string
}

export interface RevokeUserAppPayload {
  accessToken: string
  userId: number
}

export interface UpdatePasswordPayload {
  oldPassword: string
  newPassword: string
}

export interface RecoverPasswordPayload {
  code: number
  newPassword: string
}

export interface UpdateUserStatusPayload {
  status: boolean
}

export interface AssociateUserAppPayload {
  appId: number
}

export interface AppPublicKeyDto {
  publicKey: string
  url: string
}
