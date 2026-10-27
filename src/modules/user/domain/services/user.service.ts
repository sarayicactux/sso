import { RecoverPasswordInterface } from '../interfaces/user/RecoverPassword.interface';
import { UpdatePasswordInterface } from '../interfaces/user/UpdatePassword.interface';
import { LoginUserInterface } from '../interfaces/user/LoginUser.interface';
import { CreateUserInterface } from '../interfaces/user/CreateUser.interface';
import { RevokeUserAppInterface } from '../interfaces/user/RevokeUserApp.interface';
import {
  ValidateUserAppAccessInterface,
  ValidateUserAppAccessResult,
} from '../interfaces/user/ValidateUserAppAccess.interface';
import { UpdateUserStatusInterface } from '../interfaces/user/UpdateUserStatus.interface';
import {
  UpdateUserStatusByUsernameInterface,
  UpdateUserStatusByUsernameResult,
} from '../interfaces/user/UpdateUserStatusByUsername.interface';
import {
  CreateUserViaAppInterface,
  CreateUserViaAppResult,
} from '../interfaces/user/CreateUserViaApp.interface';
import { AssociateUserAppInterface } from '../interfaces/user_app/AssociateUserApp.interface';
import { UserDto } from '../../presentation/dtos/user.dto';
import { AppDto } from '../../../app/presentation/dtos/app.dto';

export interface UserServiceImpl {
  create(data: CreateUserInterface): Promise<UserDto>;
  createViaApp(data: CreateUserViaAppInterface): Promise<CreateUserViaAppResult>;
  revokeAppAccess(data: RevokeUserAppInterface): Promise<boolean>;
  login(login: LoginUserInterface, ip: string): Promise<UserDto>;
  updatePassword(
    mobile: string,
    updatePasswordDto: UpdatePasswordInterface,
  ): Promise<boolean>;
  forgetPassword(mobile: string, ip: string): Promise<string | null>;
  recoverPassword(
    recoverPasswordDto: RecoverPasswordInterface,
    recoverPassToken: string,
    ip: string,
  ): Promise<boolean>;
  logOut(token: string): Promise<boolean>;
  validateUserAppAccess(
    data: ValidateUserAppAccessInterface,
  ): Promise<ValidateUserAppAccessResult>;
  updateStatusByUsernameViaApp(
    data: UpdateUserStatusByUsernameInterface,
  ): Promise<UpdateUserStatusByUsernameResult>;
  findAllForAdmin(): Promise<UserDto[]>;
  updateStatus(data: UpdateUserStatusInterface, admin: any): Promise<UserDto>;
  getUserApps(userId: number): Promise<AppDto[]>;
  associateApp(data: AssociateUserAppInterface, admin: any): Promise<UserDto>;
  removeUserApp(
    userId: number,
    appId: number,
    admin: any,
  ): Promise<boolean>;
}
