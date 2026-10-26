import { User } from './user.entity';
import { App } from '../../../app/domain/entities/app.entity';

export class UserApp {
  readonly id: number;
  userId: number;
  appId: number;
  User?: User;
  App?: App;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(data: {
    id?: number;
    userId: number;
    appId: number;
    User?: User;
    App?: App;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.appId = data.appId;
    this.User = data.User;
    this.App = data.App;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.deletedAt = data.deletedAt || null;
  }
}
