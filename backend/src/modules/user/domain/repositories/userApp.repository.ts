import { UserApp } from '../entities/userApp.entity';
import { CreateUserAppInterface } from '../interfaces/user_app/CreateUserApp.interface';
import { App } from '../../../app/domain/entities/app.entity';

export interface UserAppRepositoryImpl {
  create(data: CreateUserAppInterface): Promise<UserApp>;
  findByUserIdAndAppId(
    userId: number,
    appId: number,
  ): Promise<UserApp | null>;
  findAppsByUserId(userId: number): Promise<App[]>;
  delete(userId: number, appId: number): Promise<boolean>;
}
