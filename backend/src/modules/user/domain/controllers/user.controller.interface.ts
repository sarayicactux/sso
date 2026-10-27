import { LoginUserInterface } from '../interfaces/user/LoginUser.interface';
import { RecoverPasswordInterface } from '../interfaces/user/RecoverPassword.interface';
import { UpdatePasswordInterface } from '../interfaces/user/UpdatePassword.interface';
import { CreateUserInterface } from '../interfaces/user/CreateUser.interface';
import { RevokeUserAppInterface } from '../interfaces/user/RevokeUserApp.interface';
import { GenerateAppPublicKeyResult } from '../interfaces/user/GenerateAppPublicKey.interface';
import { UserDto } from '../../presentation/dtos/user.dto';

export interface UserControllerImpl {
  create(data: CreateUserInterface): Promise<UserDto>;
  revokeAppAccess(data: RevokeUserAppInterface, admin: any): Promise<boolean>;
  login(login: LoginUserInterface, ip: string): Promise<UserDto>;
  updatePassword(
    user: UserDto,
    updatePasswordDto: UpdatePasswordInterface,
  ): Promise<boolean>;
  forgetPassword(body: { mobile: string }, ip: string): Promise<any>;
  recoverPassword(
    headers: any,
    recoverPasswordDto: RecoverPasswordInterface,
    ip: string,
  ): Promise<boolean>;
  logOut(user: UserDto): Promise<boolean>;
  dash(user: UserDto): Promise<UserDto>;
  generateAppPublicKey(
    user: UserDto,
    appId: number,
  ): Promise<GenerateAppPublicKeyResult>;
}
