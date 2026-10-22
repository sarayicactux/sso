import { Admin } from '../entities/admin.entity';
import { LoginInterface } from '../interfaces/admin/loginAdmin.interface';
import { RecoverPasswordInterface } from '../interfaces/admin/RecoverPassword.interface';
import { UpdatePasswordInterface } from '../interfaces/admin/UpdatePassword.interface';

export interface AdminServiceImpl {
  login(login: LoginInterface, ip: string): Promise<Admin | null>;
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
