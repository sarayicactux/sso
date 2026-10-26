import { User } from './user.entity';

export class UserToken {
  readonly id: number;
  userId: number;
  device: string;
  ip: string;
  access_token: string;
  secretKey?: string;
  lastConfirmationId?: number;
  User?: User;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(data: {
    id?: number;
    userId: number;
    device?: string;
    ip: string;
    access_token: string;
    secretKey?: string;
    lastConfirmationId?: number;
    User?: User;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.device = data.device;
    this.ip = data.ip;
    this.access_token = data.access_token;
    this.secretKey = data.secretKey;
    this.lastConfirmationId = data.lastConfirmationId;
    this.User = data.User;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.deletedAt = data.deletedAt || null;
  }
}
