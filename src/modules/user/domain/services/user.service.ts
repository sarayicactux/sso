import { RecoverPasswordInterface } from '../interfaces/user/RecoverPassword.interface';
import { UpdatePasswordInterface } from '../interfaces/user/UpdatePassword.interface';
import { LoginUserInterface } from '../interfaces/user/LoginUser.interface';
import { CreateUserInterface } from '../interfaces/user/CreateUser.interface';
import { RevokeUserAppInterface } from '../interfaces/user/RevokeUserApp.interface';
import { UserDto } from '../../presentation/dtos/user.dto';

export interface UserServiceImpl {
  create(data: CreateUserInterface): Promise<UserDto>;
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
}
