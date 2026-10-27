export interface AdminDto {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  mobile: string
  access_token?: string
  createdAt?: string
  updatedAt?: string
}

export interface AdminLoginPayload {
  username: string
  password: string
}

export interface UpdatePasswordPayload {
  oldPassword: string
  newPassword: string
}

export interface RecoverPasswordPayload {
  code: number
  newPassword: string
}
