import { Admin } from './admin.entity';
export class AdminToken {
  readonly id: number;
  adminId: number;
  device: string;
  ip: string;
  access_token: string;
  secretKey?: string;
  fireBaseToken?: string;
  lastConfirmationId?: number;
  Admin?: Admin;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(data: {
    id?: number;
    adminId: number;
    device?: string;
    ip: string;
    access_token: string;
    secretKey?: string;
    fireBaseToken?: string;
    lastConfirmationId?: number;
    Admin?: Admin;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }) {
    this.id = data.id;
    this.adminId = data.adminId;
    this.device = data.device;
    this.ip = data.ip;
    this.access_token = data.access_token;
    this.secretKey = data.secretKey;
    this.fireBaseToken = data.fireBaseToken;
    this.lastConfirmationId = data.lastConfirmationId;
    this.Admin = data.Admin;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.deletedAt = data.deletedAt || null;
  }
}
