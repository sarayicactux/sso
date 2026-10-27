import { AppDto } from '../../presentation/dtos/app.dto';
import { CreateAppInterface } from '../interfaces/app/CreateApp.interface';
import { UpdateAppInterface } from '../interfaces/app/UpdateApp.interface';

export interface AppControllerImpl {
  create(createApp: CreateAppInterface, admin: any): Promise<AppDto | null>;
  update(
    updateApp: UpdateAppInterface,
    id: number,
    admin: any,
  ): Promise<boolean>;
  updateStatus(
    id: number,
    body: { status: boolean },
    admin: any,
  ): Promise<boolean>;
  updateActiveSession(
    id: number,
    body: { activeSession: boolean },
    admin: any,
  ): Promise<boolean>;
  regenerateAccessToken(id: number, admin: any): Promise<AppDto | null>;
  findById(id: number, admin: any): Promise<AppDto | null>;
  findByAccessToken(accessToken: string, admin: any): Promise<AppDto | null>;
  findAll(admin: any): Promise<AppDto[]>;
}
