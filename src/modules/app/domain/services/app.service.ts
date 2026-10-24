import { AppDto } from '../../presentation/dtos/app.dto';
import { CreateAppInterface } from '../interfaces/app/CreateApp.interface';
import { UpdateAppInterface } from '../interfaces/app/UpdateApp.interface';
import { UpdateActiveSessionInterface } from '../interfaces/app/UpdateAppActiveSession.interface';
import { UpdateStatusInterface } from '../interfaces/app/UpdateAppStatus.interface';

export interface AppServiceImpl {
  create(createApp: CreateAppInterface, admin: any): Promise<AppDto | null>;
  update(id: number, data: UpdateAppInterface, admin: any): Promise<boolean>;
  updateStatus(data: UpdateStatusInterface, admin: any): Promise<boolean>;
  updateActiveSession(
    data: UpdateActiveSessionInterface,
    admin: any,
  ): Promise<boolean>;
  regenerateAccessToken(id: number, admin: any): Promise<AppDto | null>;
  findById(id: number): Promise<AppDto | null>;
  findByAccessToken(accessToken: string): Promise<AppDto | null>;
  findAll(): Promise<AppDto[]>;
}
