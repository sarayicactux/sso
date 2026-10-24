import { App } from '../entities/app.entity';
import { CreateAppInterface } from '../interfaces/app/CreateApp.interface';
import { UpdateAppInterface } from '../interfaces/app/UpdateApp.interface';
import { UpdateActiveSessionInterface } from '../interfaces/app/UpdateAppActiveSession.interface';
import { UpdateStatusInterface } from '../interfaces/app/UpdateAppStatus.interface';

export interface AppRepositoryImpl {
  create(data: CreateAppInterface): Promise<App>;
  update(id: number, data: UpdateAppInterface): Promise<boolean>;
  updateStatus(data: UpdateStatusInterface): Promise<boolean>;
  updateActiveSession(data: UpdateActiveSessionInterface): Promise<boolean>;
  findById(id: number): Promise<App | null>;
  findByAccessToken(accessToken: string): Promise<App | null>;
  findAll(): Promise<App[]>;
}
