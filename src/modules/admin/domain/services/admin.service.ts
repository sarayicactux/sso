import { RecoverPasswordInterface } from '../interfaces/admin/RecoverPassword.interface';
import { UpdatePasswordInterface } from '../interfaces/admin/UpdatePassword.interface';
import { LoginInterface } from '../interfaces/admin/loginAdmin.interface';
import { AdminDto } from '../../presentation/dtos/admin.dto';

export interface AdminServiceImpl {
  seeder();
  login(login: LoginInterface, ip: string): Promise<AdminDto | null>;
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
