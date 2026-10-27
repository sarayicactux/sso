import { AppUser } from '../entities/appUser';
import { CreateAppUserInterface } from '../interfaces/app_user/CreateAppUser.interface';

export interface AppUserRepositoryImpl {
  create(data: CreateAppUserInterface): Promise<AppUser>;
  findByUserIdAndAppId(
    userId: number,
    appId: number,
    access_token: string,
  ): Promise<AppUser | null>;
  deleteByUserIdAndAppId(userId: number, appId: number): Promise<boolean>;
}
