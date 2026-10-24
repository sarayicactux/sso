import { App } from '../entities/app.entity';
import { CreateAppInterface } from '../interfaces/app/CreateApp.interface';
import { UpdateAppInterface } from '../interfaces/app/UpdateApp.interface';
import { UpdateActiveSessionInterface } from '../interfaces/app/UpdateAppActiveSession.interface';
import { UpdateStatusInterface } from '../interfaces/app/UpdateAppStatus.interface';
import { UpdateAccessTokenInterface } from '../interfaces/app/UpdateAppAccessToken.interface';

export type CreateAppData = CreateAppInterface & {
  adminId: number;
  accessToken: string;
  status?: boolean;
  activeSession?: boolean;
};

export interface AppRepositoryImpl {
  create(data: CreateAppData): Promise<App>;
  update(id: number, data: UpdateAppInterface): Promise<boolean>;
  updateStatus(data: UpdateStatusInterface): Promise<boolean>;
  updateActiveSession(data: UpdateActiveSessionInterface): Promise<boolean>;
  updateAccessToken(data: UpdateAccessTokenInterface): Promise<boolean>;
  findById(id: number): Promise<App | null>;
  findByAccessToken(accessToken: string): Promise<App | null>;
  findAll(): Promise<App[]>;
}
