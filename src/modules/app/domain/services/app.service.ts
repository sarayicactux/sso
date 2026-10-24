import { App } from '../entities/app.entity';
import { CreateAppInterface } from '../interfaces/app/CreateApp.interface';
import { UpdateAppInterface } from '../interfaces/app/UpdateApp.interface';
import { UpdateActiveSessionInterface } from '../interfaces/app/UpdateAppActiveSession.interface';
import { UpdateStatusInterface } from '../interfaces/app/UpdateAppStatus.interface';

export interface AppServiceImpl {
  create(createApp: CreateAppInterface, admin: any): Promise<App | null>;
  update(id: number, data: UpdateAppInterface, admin: any): Promise<boolean>;
  updateStatus(data: UpdateStatusInterface, admin: any): Promise<boolean>;
  updateActiveSession(
    data: UpdateActiveSessionInterface,
    admin: any,
  ): Promise<boolean>;
  findById(id: number): Promise<App | null>;
  findByAccessToken(accessToken: string): Promise<App | null>;
  findAll(): Promise<App[]>;
}
