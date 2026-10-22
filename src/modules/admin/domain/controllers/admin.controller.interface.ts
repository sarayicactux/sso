import { Admin } from '../entities/admin.entity';
import { LoginInterface } from '../interfaces/admin/loginAdmin.interface';
import { RecoverPasswordInterface } from '../interfaces/admin/RecoverPassword.interface';
import { UpdatePasswordInterface } from '../interfaces/admin/UpdatePassword.interface';

export interface AdminControllerImpl {
  login(login: LoginInterface): Promise<Admin | null>;
  updatePassword(
    mobile: string,
    updatePasswordDto: UpdatePasswordInterface,
  ): Promise<boolean>;
  forgetPassword(mobile: string): Promise<string | null>;
  recoverPassword(
    recoverPasswordDto: RecoverPasswordInterface,
    recoverPassToken: string,
  ): Promise<boolean>;
  logOut(token: string): Promise<boolean>;
}
