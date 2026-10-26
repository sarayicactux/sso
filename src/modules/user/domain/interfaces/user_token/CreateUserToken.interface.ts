export interface CreateUserTokenInterface {
  userId: number;
  device?: string;
  ip: string;
  access_token: string;
  secretKey?: string;
  lastConfirmationId?: number;
}
