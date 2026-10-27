export interface CreateAdminTokenInterface {
  adminId: number;
  device?: string;
  ip: string;
  access_token: string;
  secretKey?: string;
  lastConfirmationId?: number;
}
