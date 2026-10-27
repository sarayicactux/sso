import { User } from './user.entity';
import { App } from '../../../app/domain/entities/app.entity';

export class AppUser {
  readonly id: number;
  userId: number;
  appId: number;
  User?: User;
  App?: App;
  access_token: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(data: {
    id?: number;
    userId: number;
    appId: number;
    User?: User;
    App?: App;
    access_token: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.appId = data.appId;
    this.User = data.User;
    this.App = data.App;
    this.access_token = data.access_token;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.deletedAt = data.deletedAt || null;
  }
}
